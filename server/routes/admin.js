const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorizeAdmin);

// ==================== CUSTOMERS ====================

// Get all customers
router.get('/customers', (req, res) => {
  const database = db.getDb();
  database.all('SELECT * FROM customers ORDER BY created_at DESC', (err, customers) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json({ customers });
  });
});

// Add customer
router.post('/customers', [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, phone, email, address, notes } = req.body;
  const database = db.getDb();

  database.run(
    'INSERT INTO customers (name, phone, email, address, notes) VALUES (?, ?, ?, ?, ?)',
    [name, phone, email || null, address || null, notes || null],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error adding customer', error: err.message });
      }
      res.status(201).json({ message: 'Customer added successfully', id: this.lastID });
    }
  );
});

// Update customer
router.put('/customers/:id', (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address, notes } = req.body;
  const database = db.getDb();

  database.run(
    'UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, notes = ? WHERE id = ?',
    [name, phone, email || null, address || null, notes || null, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating customer', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json({ message: 'Customer updated successfully' });
    }
  );
});

// Delete customer
router.delete('/customers/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();

  database.run('DELETE FROM customers WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting customer', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  });
});

// ==================== SERVICES ====================

// Get all services
router.get('/services', (req, res) => {
  const database = db.getDb();
  database.all(`
    SELECT 
      s.*,
      c.name as db_customer_name,
      c.phone as db_customer_phone,
      c.address as db_customer_address,
      c.email as db_customer_email,
      t.name as technician_name,
      t.phone as technician_phone,
      p.amount as payment_amount,
      p.status as payment_status
    FROM services s
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN technicians t ON s.technician_id = t.id
    LEFT JOIN payments p ON s.id = p.service_id
    ORDER BY s.created_at DESC
  `, (err, services) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    // Merge customer info
    const enrichedServices = services.map(s => ({
      ...s,
      display_customer_name: s.db_customer_name || s.customer_name || '-',
      display_customer_phone: s.db_customer_phone || s.customer_phone || '-',
      display_customer_address: s.db_customer_address || s.customer_address || '-'
    }));
    res.json({ services: enrichedServices });
  });
});

// Create service (admin)
router.post('/services', [
  body('service_type').notEmpty().withMessage('Service type is required'),
  body('company').notEmpty().withMessage('Company is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { customer_id, customer_name, customer_phone, customer_address, service_type, company, description, service_date, technician_id, due_date } = req.body;
  
  if (!customer_id && !customer_name) {
    return res.status(400).json({ message: 'Please provide a customer name or select a customer' });
  }

  const database = db.getDb();

  const adminUserId = req.user.id; // Admin who is creating this service

  // If customer_name is typed and no customer_id, auto-create customer
  if (!customer_id && customer_name) {
    database.run(
      'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)',
      [customer_name, customer_phone || '', customer_address || ''],
      function(err) {
        const newCustomerId = err ? null : this.lastID;
        
        database.run(
          'INSERT INTO services (user_id, customer_id, customer_name, customer_phone, customer_address, service_type, company, description, service_date, technician_id, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [adminUserId, newCustomerId, customer_name, customer_phone || null, customer_address || null, service_type, company, description || null, service_date || null, technician_id || null, due_date || null, 'pending'],
          function(err) {
            if (err) {
              return res.status(500).json({ message: 'Error creating service', error: err.message });
            }
            res.status(201).json({ message: 'Service created successfully', id: this.lastID, customer_id: newCustomerId });
          }
        );
      }
    );
  } else {
    database.run(
      'INSERT INTO services (user_id, customer_id, customer_name, customer_phone, customer_address, service_type, company, description, service_date, technician_id, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [adminUserId, customer_id || null, customer_name || null, customer_phone || null, customer_address || null, service_type, company, description || null, service_date || null, technician_id || null, due_date || null, 'pending'],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error creating service', error: err.message });
        }
        res.status(201).json({ message: 'Service created successfully', id: this.lastID });
      }
    );
  }
});

// Update service details
router.put('/services/:id', (req, res) => {
  const { id } = req.params;
  const { service_type, company, description, service_date, due_date, customer_name, customer_phone, customer_address } = req.body;
  const database = db.getDb();

  database.run(
    'UPDATE services SET service_type = ?, company = ?, description = ?, service_date = ?, due_date = ?, customer_name = ?, customer_phone = ?, customer_address = ? WHERE id = ?',
    [service_type, company, description, service_date, due_date || null, customer_name, customer_phone, customer_address, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating service', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.json({ message: 'Service updated successfully' });
    }
  );
});

// Delete service
router.delete('/services/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();

  database.run('DELETE FROM payments WHERE service_id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting service payments', error: err.message });
    }
    database.run('DELETE FROM services WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting service', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.json({ message: 'Service deleted successfully' });
    });
  });
});

// Assign technician to service
router.put('/services/:id/assign', (req, res) => {
  const { id } = req.params;
  const { technician_id } = req.body;
  const database = db.getDb();

  database.run(
    'UPDATE services SET technician_id = ?, status = CASE WHEN status = \'pending\' THEN \'assigned\' ELSE status END WHERE id = ?',
    [technician_id || null, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error assigning technician', error: err.message });
      }
      res.json({ message: 'Technician assigned successfully' });
    }
  );
});

// Update service status
router.put('/services/:id/status', [
  body('status').isIn(['pending', 'assigned', 'in_progress', 'completed']).withMessage('Invalid status')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { status } = req.body;
  const database = db.getDb();

  const completedDate = status === 'completed' ? new Date().toISOString() : null;

  database.run(
    'UPDATE services SET status = ?, completed_date = COALESCE(?, completed_date) WHERE id = ?',
    [status, completedDate, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating status', error: err.message });
      }
      res.json({ message: 'Status updated successfully' });
    }
  );
});

// Get services due soon (for admin overview)
router.get('/due-services', (req, res) => {
  const database = db.getDb();
  database.all(`
    SELECT 
      s.*,
      c.name as db_customer_name,
      c.phone as db_customer_phone,
      t.name as technician_name,
      t.phone as technician_phone
    FROM services s
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN technicians t ON s.technician_id = t.id
    WHERE s.due_date IS NOT NULL 
      AND s.due_date >= datetime('now')
    ORDER BY s.due_date ASC
  `, (err, services) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    const enrichedServices = services.map(s => ({
      ...s,
      display_customer_name: s.db_customer_name || s.customer_name || '-',
      display_customer_phone: s.db_customer_phone || s.customer_phone || '-'
    }));
    res.json({ services: enrichedServices });
  });
});

// ==================== TECHNICIANS ====================

// Get all technicians
router.get('/technicians', (req, res) => {
  const database = db.getDb();
  database.all('SELECT id, name, email, phone, specialization, upi_id, created_at FROM technicians ORDER BY created_at DESC', (err, technicians) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json({ technicians });
  });
});

// Add technician (with password for login)
router.post('/technicians', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, specialization, password, upi_id } = req.body;
  const database = db.getDb();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    database.run(
      'INSERT INTO technicians (name, email, phone, specialization, password, upi_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, specialization || null, hashedPassword, upi_id || null],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ message: 'A technician with this email already exists' });
          }
          return res.status(500).json({ message: 'Error creating technician', error: err.message });
        }
        res.status(201).json({ message: 'Technician added successfully', id: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update technician
router.put('/technicians/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, specialization, password, upi_id } = req.body;
  const database = db.getDb();

  try {
    if (password && password.length >= 6) {
      // Update with new password
      const hashedPassword = await bcrypt.hash(password, 10);
      database.run(
        'UPDATE technicians SET name = ?, email = ?, phone = ?, specialization = ?, password = ?, upi_id = ? WHERE id = ?',
        [name, email, phone, specialization || null, hashedPassword, upi_id || null, id],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error updating technician', error: err.message });
          }
          if (this.changes === 0) {
            return res.status(404).json({ message: 'Technician not found' });
          }
          res.json({ message: 'Technician updated successfully (password changed)' });
        }
      );
    } else {
      // Update without password
      database.run(
        'UPDATE technicians SET name = ?, email = ?, phone = ?, specialization = ?, upi_id = ? WHERE id = ?',
        [name, email, phone, specialization || null, upi_id || null, id],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error updating technician', error: err.message });
          }
          if (this.changes === 0) {
            return res.status(404).json({ message: 'Technician not found' });
          }
          res.json({ message: 'Technician updated successfully' });
        }
      );
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete technician
router.delete('/technicians/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();

  database.run('DELETE FROM technicians WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting technician', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    res.json({ message: 'Technician deleted successfully' });
  });
});

// ==================== PAYMENT SETTINGS ====================

// Get all payment settings
router.get('/payment-settings', (req, res) => {
  const database = db.getDb();
  database.all('SELECT * FROM payment_settings ORDER BY service_type', (err, settings) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json({ settings });
  });
});

// Set payment amount for service type
router.post('/payment-settings', [
  body('service_type').notEmpty().withMessage('Service type is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { service_type, amount } = req.body;
  const database = db.getDb();

  database.get('SELECT * FROM payment_settings WHERE service_type = ?', [service_type], (err, existing) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }

    if (existing) {
      database.run(
        'UPDATE payment_settings SET amount = ?, updated_at = CURRENT_TIMESTAMP WHERE service_type = ?',
        [amount, service_type],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error updating payment setting', error: err.message });
          }
          res.json({ message: 'Payment setting updated successfully' });
        }
      );
    } else {
      database.run(
        'INSERT INTO payment_settings (service_type, amount) VALUES (?, ?)',
        [service_type, amount],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error creating payment setting', error: err.message });
          }
          res.status(201).json({ message: 'Payment setting created successfully', id: this.lastID });
        }
      );
    }
  });
});

// Delete payment setting
router.delete('/payment-settings/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();

  database.run('DELETE FROM payment_settings WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting payment setting', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Payment setting not found' });
    }
    res.json({ message: 'Payment setting deleted successfully' });
  });
});

// ==================== PAYMENTS ====================

// Get all payments
router.get('/payments', (req, res) => {
  const database = db.getDb();
  database.all(`
    SELECT 
      p.*,
      s.service_type,
      s.company,
      s.service_date,
      s.completed_date,
      s.customer_name,
      s.customer_phone,
      c.name as db_customer_name,
      c.phone as db_customer_phone,
      t.name as technician_name
    FROM payments p
    JOIN services s ON p.service_id = s.id
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN technicians t ON s.technician_id = t.id
    ORDER BY p.created_at DESC
  `, [], (err, payments) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    const enrichedPayments = payments.map(p => ({
      ...p,
      display_customer_name: p.db_customer_name || p.customer_name || '-',
      display_customer_phone: p.db_customer_phone || p.customer_phone || '-'
    }));
    res.json({ payments: enrichedPayments });
  });
});

// Create payment for service
router.post('/payments', [
  body('service_id').notEmpty().withMessage('Service ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { service_id, amount, status, pay_to, upi_id } = req.body;
  const database = db.getDb();

  database.run(
    'INSERT INTO payments (service_id, amount, status, pay_to, upi_id) VALUES (?, ?, ?, ?, ?)',
    [service_id, amount, status || 'pending', pay_to || 'admin', upi_id || null],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating payment', error: err.message });
      }
      res.status(201).json({ message: 'Payment created successfully', id: this.lastID });
    }
  );
});

// Update payment
router.put('/payments/:id', (req, res) => {
  const { id } = req.params;
  const { amount, status, pay_to, upi_id } = req.body;
  const database = db.getDb();

  database.run(
    'UPDATE payments SET amount = ?, status = ?, pay_to = ?, upi_id = ? WHERE id = ?',
    [amount, status, pay_to || 'admin', upi_id || null, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating payment', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.json({ message: 'Payment updated successfully' });
    }
  );
});

// ==================== UPI SETTINGS ====================

// Get UPI settings
router.get('/upi-settings', (req, res) => {
  const database = db.getDb();
  database.all('SELECT * FROM upi_settings ORDER BY created_at DESC', (err, settings) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json({ settings });
  });
});

// Add/Update UPI setting
router.post('/upi-settings', [
  body('upi_id').notEmpty().withMessage('UPI ID is required'),
  body('name').notEmpty().withMessage('Name is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { upi_id, name } = req.body;
  const database = db.getDb();

  // Check if same UPI ID exists
  database.get('SELECT * FROM upi_settings WHERE upi_id = ?', [upi_id], (err, existing) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }

    if (existing) {
      database.run(
        'UPDATE upi_settings SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE upi_id = ?',
        [name, upi_id],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error updating UPI setting', error: err.message });
          }
          res.json({ message: 'UPI setting updated successfully' });
        }
      );
    } else {
      // Deactivate all others first, then add new one as active
      database.run('UPDATE upi_settings SET is_active = 0', function(err) {
        database.run(
          'INSERT INTO upi_settings (upi_id, name, is_active) VALUES (?, ?, 1)',
          [upi_id, name],
          function(err) {
            if (err) {
              return res.status(500).json({ message: 'Error adding UPI setting', error: err.message });
            }
            res.status(201).json({ message: 'UPI setting added successfully', id: this.lastID });
          }
        );
      });
    }
  });
});

// Set active UPI
router.put('/upi-settings/:id/activate', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();

  database.run('UPDATE upi_settings SET is_active = 0', function(err) {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    database.run('UPDATE upi_settings SET is_active = 1 WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error activating UPI', error: err.message });
      }
      res.json({ message: 'UPI activated successfully' });
    });
  });
});

// Delete UPI setting
router.delete('/upi-settings/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();

  database.run('DELETE FROM upi_settings WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting UPI setting', error: err.message });
    }
    res.json({ message: 'UPI setting deleted successfully' });
  });
});

// Get active UPI (for QR code generation)
router.get('/active-upi', (req, res) => {
  const database = db.getDb();
  database.get('SELECT * FROM upi_settings WHERE is_active = 1', (err, setting) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json({ upi: setting || null });
  });
});

// ==================== DASHBOARD ====================

router.get('/dashboard', (req, res) => {
  const database = db.getDb();
  
  const stats = {};

  database.get('SELECT COUNT(*) as count FROM services', (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    stats.totalServices = result.count;

    database.get('SELECT COUNT(*) as count FROM services WHERE status = ?', ['completed'], (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err.message });
      stats.completedServices = result.count;

      database.get('SELECT COUNT(*) as count FROM services WHERE status IN (?, ?, ?)', ['pending', 'assigned', 'in_progress'], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err.message });
        stats.activeServices = result.count;

        database.get('SELECT COUNT(*) as count FROM customers', (err, result) => {
          if (err) return res.status(500).json({ message: 'Server error', error: err.message });
          stats.totalCustomers = result.count;

          database.get('SELECT COUNT(*) as count FROM technicians', (err, result) => {
            if (err) return res.status(500).json({ message: 'Server error', error: err.message });
            stats.totalTechnicians = result.count;

            database.get('SELECT SUM(amount) as total FROM payments WHERE status = ?', ['completed'], (err, result) => {
              if (err) return res.status(500).json({ message: 'Server error', error: err.message });
              stats.totalRevenue = result.total || 0;

              database.get(`SELECT COUNT(*) as count FROM services WHERE due_date IS NOT NULL AND due_date <= datetime('now', '+30 days') AND due_date >= datetime('now')`, (err, result) => {
                if (err) return res.status(500).json({ message: 'Server error', error: err.message });
                stats.dueSoon = result.count;

                res.json({ stats });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
