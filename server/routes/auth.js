const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../database');
const { authenticate } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Admin Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const database = db.getDb();

    database.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Technician Login
router.post('/technician-login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const database = db.getDb();

    database.get('SELECT * FROM technicians WHERE email = ?', [email], async (err, tech) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }

      if (!tech) {
        return res.status(400).json({ message: 'Invalid credentials. Please check your email.' });
      }

      if (!tech.password) {
        return res.status(400).json({ message: 'Password not set. Please contact admin to set your password.' });
      }

      const isMatch = await bcrypt.compare(password, tech.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials. Wrong password.' });
      }

      const token = jwt.sign(
        { id: tech.id, email: tech.email, role: 'technician' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Technician login successful',
        token,
        user: {
          id: tech.id,
          name: tech.name,
          email: tech.email,
          phone: tech.phone,
          specialization: tech.specialization,
          role: 'technician'
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user (admin or technician)
router.get('/me', authenticate, (req, res) => {
  const database = db.getDb();
  
  if (req.user.role === 'technician') {
    database.get('SELECT id, name, email, phone, specialization FROM technicians WHERE id = ?', [req.user.id], (err, tech) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }
      if (!tech) {
        return res.status(404).json({ message: 'Technician not found' });
      }
      res.json({ user: { ...tech, role: 'technician' } });
    });
  } else {
    database.get('SELECT id, name, email, phone, address, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user });
    });
  }
});

module.exports = router;
