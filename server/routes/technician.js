const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate, authorizeTechnician } = require('../middleware/auth');

// All technician routes require authentication and technician role
router.use(authenticate);
router.use(authorizeTechnician);

// Get technician's assigned services with full customer details
router.get('/my-services', (req, res) => {
  const database = db.getDb();
  database.all(`
    SELECT 
      s.*,
      c.name as db_customer_name,
      c.phone as db_customer_phone,
      c.address as db_customer_address,
      c.email as db_customer_email,
      p.amount as payment_amount,
      p.status as payment_status
    FROM services s
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN payments p ON s.id = p.service_id
    WHERE s.technician_id = ?
    ORDER BY 
      CASE s.status 
        WHEN 'pending' THEN 1 
        WHEN 'assigned' THEN 2 
        WHEN 'in_progress' THEN 3 
        WHEN 'completed' THEN 4 
      END,
      s.service_date ASC
  `, [req.user.id], (err, services) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    // Merge customer info from customers table or direct fields
    const enrichedServices = services.map(s => ({
      ...s,
      customer_name: s.db_customer_name || s.customer_name || 'Unknown',
      customer_phone: s.db_customer_phone || s.customer_phone || '-',
      customer_address: s.db_customer_address || s.customer_address || '-',
      customer_email: s.db_customer_email || ''
    }));
    res.json({ services: enrichedServices });
  });
});

// Get services due soon (next 30 days) for this technician
router.get('/due-services', (req, res) => {
  const database = db.getDb();
  database.all(`
    SELECT 
      s.*,
      c.name as db_customer_name,
      c.phone as db_customer_phone,
      c.address as db_customer_address,
      p.amount as payment_amount,
      p.status as payment_status
    FROM services s
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN payments p ON s.id = p.service_id
    WHERE s.technician_id = ? 
      AND s.due_date IS NOT NULL 
      AND s.due_date <= datetime('now', '+30 days')
      AND s.due_date >= datetime('now')
    ORDER BY s.due_date ASC
  `, [req.user.id], (err, services) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    const enrichedServices = services.map(s => ({
      ...s,
      customer_name: s.db_customer_name || s.customer_name || 'Unknown',
      customer_phone: s.db_customer_phone || s.customer_phone || '-',
      customer_address: s.db_customer_address || s.customer_address || '-'
    }));
    res.json({ services: enrichedServices });
  });
});

// Update service status (technician can mark as in_progress or completed)
router.put('/services/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const database = db.getDb();

  // Technician can only set these statuses
  const allowedStatuses = ['in_progress', 'completed'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Technicians can only set status to "in_progress" or "completed"' });
  }

  const completedDate = status === 'completed' ? new Date().toISOString() : null;

  // Only allow updating services assigned to this technician
  database.run(
    'UPDATE services SET status = ?, completed_date = COALESCE(?, completed_date) WHERE id = ? AND technician_id = ?',
    [status, completedDate, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating status', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Service not found or not assigned to you' });
      }
      res.json({ message: 'Service status updated successfully' });
    }
  );
});

// Get technician dashboard stats
router.get('/dashboard', (req, res) => {
  const database = db.getDb();
  const techId = req.user.id;
  const stats = {};

  database.get('SELECT COUNT(*) as count FROM services WHERE technician_id = ?', [techId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    stats.totalAssigned = result.count;

    database.get('SELECT COUNT(*) as count FROM services WHERE technician_id = ? AND status = ?', [techId, 'pending'], (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err.message });
      stats.pendingServices = result.count;

      database.get('SELECT COUNT(*) as count FROM services WHERE technician_id = ? AND status = ?', [techId, 'in_progress'], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err.message });
        stats.inProgressServices = result.count;

        database.get('SELECT COUNT(*) as count FROM services WHERE technician_id = ? AND status = ?', [techId, 'completed'], (err, result) => {
          if (err) return res.status(500).json({ message: 'Server error', error: err.message });
          stats.completedServices = result.count;

          database.get(`SELECT COUNT(*) as count FROM services WHERE technician_id = ? AND due_date IS NOT NULL AND due_date <= datetime('now', '+30 days') AND due_date >= datetime('now')`, [techId], (err, result) => {
            if (err) return res.status(500).json({ message: 'Server error', error: err.message });
            stats.dueSoon = result.count;

            res.json({ stats });
          });
        });
      });
    });
  });
});

// Get technician's profile
router.get('/profile', (req, res) => {
  const database = db.getDb();
  database.get('SELECT id, name, email, phone, specialization, upi_id FROM technicians WHERE id = ?', [req.user.id], (err, tech) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    if (!tech) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    res.json({ technician: tech });
  });
});

// Get payment QR details for a service (technician shows to customer)
router.get('/payment-qr/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  const database = db.getDb();

  // Get payment details for this service
  database.get(`
    SELECT 
      p.*,
      s.service_type,
      s.company,
      s.customer_name,
      s.customer_phone,
      c.name as db_customer_name,
      t.name as technician_name,
      t.upi_id as technician_upi_id
    FROM payments p
    JOIN services s ON p.service_id = s.id
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN technicians t ON s.technician_id = t.id
    WHERE p.service_id = ? AND s.technician_id = ?
  `, [serviceId, req.user.id], (err, payment) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    if (!payment) {
      return res.status(404).json({ message: 'No payment found for this service' });
    }

    // If pay_to is admin, get admin's active UPI
    if (payment.pay_to === 'admin' || !payment.upi_id) {
      database.get('SELECT * FROM upi_settings WHERE is_active = 1', (err, upiSetting) => {
        if (err) {
          return res.status(500).json({ message: 'Server error', error: err.message });
        }
        res.json({
          payment: {
            ...payment,
            display_customer_name: payment.db_customer_name || payment.customer_name || 'Customer',
            qr_upi_id: payment.upi_id || (upiSetting ? upiSetting.upi_id : null),
            qr_name: upiSetting ? upiSetting.name : 'Service Company',
            pay_to_label: 'Admin'
          }
        });
      });
    } else {
      // Pay to technician
      res.json({
        payment: {
          ...payment,
          display_customer_name: payment.db_customer_name || payment.customer_name || 'Customer',
          qr_upi_id: payment.upi_id || payment.technician_upi_id,
          qr_name: payment.technician_name || 'Technician',
          pay_to_label: 'Technician'
        }
      });
    }
  });
});

// Mark payment as collected (technician confirms customer paid)
router.put('/payment-collected/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  const database = db.getDb();

  database.run(
    `UPDATE payments SET status = 'completed', payment_method = 'upi' WHERE service_id = ? AND EXISTS (SELECT 1 FROM services WHERE id = ? AND technician_id = ?)`,
    [serviceId, serviceId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating payment', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Payment not found or not assigned to you' });
      }
      res.json({ message: 'Payment marked as collected' });
    }
  );
});

module.exports = router;
