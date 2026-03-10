const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate, authorizeUser } = require('../middleware/auth');

// All user routes require authentication and user role
router.use(authenticate);
router.use(authorizeUser);

// Get user's services
router.get('/services', (req, res) => {
  const database = db.getDb();
  database.all(`
    SELECT 
      s.*,
      t.name as technician_name,
      t.phone as technician_phone,
      p.amount as payment_amount,
      p.status as payment_status
    FROM services s
    LEFT JOIN technicians t ON s.technician_id = t.id
    LEFT JOIN payments p ON s.id = p.service_id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `, [req.user.id], (err, services) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json({ services });
  });
});

// Get user profile
router.get('/profile', (req, res) => {
  const database = db.getDb();
  database.get('SELECT id, name, email, phone, address FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  });
});

// Update user profile
router.put('/profile', (req, res) => {
  const { name, phone, address } = req.body;
  const database = db.getDb();

  database.run(
    'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
    [name, phone, address, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating profile', error: err.message });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

module.exports = router;
