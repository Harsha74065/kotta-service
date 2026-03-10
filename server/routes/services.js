const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Create service request (users only)
router.post('/', authenticate, [
  body('service_type').notEmpty().withMessage('Service type is required'),
  body('company').notEmpty().withMessage('Company is required'),
  body('description').optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { service_type, company, description, service_date } = req.body;
  const database = db.getDb();

  database.run(
    'INSERT INTO services (user_id, service_type, company, description, service_date, status) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, service_type, company, description || null, service_date || null, 'pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating service request', error: err.message });
      }

      // Get payment setting for this service type
      database.get('SELECT amount FROM payment_settings WHERE service_type = ?', [service_type], (err, setting) => {
        if (!err && setting) {
          // Auto-create payment if setting exists
          database.run(
            'INSERT INTO payments (service_id, amount, status) VALUES (?, ?, ?)',
            [this.lastID, setting.amount, 'pending']
          );
        }
      });

      res.status(201).json({ 
        message: 'Service request created successfully', 
        serviceId: this.lastID 
      });
    }
  );
});

// Get service by ID
router.get('/:id', authenticate, (req, res) => {
  const database = db.getDb();
  const { id } = req.params;

  database.get(`
    SELECT 
      s.*,
      u.name as user_name,
      u.email as user_email,
      t.name as technician_name,
      t.phone as technician_phone,
      p.amount as payment_amount,
      p.status as payment_status
    FROM services s
    LEFT JOIN users u ON s.user_id = u.id
    LEFT JOIN technicians t ON s.technician_id = t.id
    LEFT JOIN payments p ON s.id = p.service_id
    WHERE s.id = ?
  `, [id], (err, service) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user has access (admin or owner)
    if (req.user.role !== 'admin' && service.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ service });
  });
});

module.exports = router;
