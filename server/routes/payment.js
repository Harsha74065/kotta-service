const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../database');
const { authenticate } = require('../middleware/auth');

// Check if Razorpay keys are configured (not placeholder values)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const isRazorpayConfigured = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && 
  !RAZORPAY_KEY_ID.includes('YOUR_ACTUAL') && 
  !RAZORPAY_KEY_SECRET.includes('YOUR_ACTUAL') &&
  RAZORPAY_KEY_ID.startsWith('rzp_');

let razorpay = null;
if (isRazorpayConfigured) {
  try {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay initialized with REAL test keys');
  } catch (err) {
    console.log('⚠️ Razorpay SDK error, falling back to DUMMY mode');
  }
} else {
  console.log('🧪 Razorpay running in DUMMY TEST MODE (no real keys configured)');
}

// All payment routes require authentication
router.use(authenticate);

// Get payment mode info
router.get('/get-key', (req, res) => {
  if (isRazorpayConfigured && razorpay) {
    res.json({ key: RAZORPAY_KEY_ID, mode: 'razorpay' });
  } else {
    res.json({ key: 'dummy_test_key', mode: 'dummy' });
  }
});

// Create Order (works in both REAL and DUMMY mode)
router.post('/create-order', async (req, res) => {
  try {
    const { service_id } = req.body;
    const database = db.getDb();

    database.get(
      `SELECT s.*, p.id as payment_id, p.amount, p.status as payment_status 
       FROM services s 
       LEFT JOIN payments p ON s.id = p.service_id 
       WHERE s.id = ? AND s.user_id = ?`,
      [service_id, req.user.id],
      async (err, service) => {
        if (err) {
          return res.status(500).json({ message: 'Server error', error: err.message });
        }
        if (!service) {
          return res.status(404).json({ message: 'Service not found' });
        }
        if (!service.payment_id) {
          return res.status(400).json({ message: 'No payment created for this service yet. Please contact admin.' });
        }
        if (service.payment_status === 'completed') {
          return res.status(400).json({ message: 'Payment already completed for this service' });
        }

        const amount = service.amount;
        if (!amount || amount <= 0) {
          return res.status(400).json({ message: 'Invalid payment amount. Please contact admin.' });
        }

        // ===== REAL RAZORPAY MODE =====
        if (isRazorpayConfigured && razorpay) {
          try {
            const order = await razorpay.orders.create({
              amount: Math.round(amount * 100),
              currency: 'INR',
              receipt: `service_${service_id}_${Date.now()}`,
              notes: {
                service_id: service_id.toString(),
                user_id: req.user.id.toString(),
                service_type: service.service_type || '',
                payment_id: service.payment_id.toString()
              }
            });

            database.run(
              'UPDATE payments SET razorpay_order_id = ? WHERE id = ?',
              [order.id, service.payment_id]
            );

            return res.json({
              success: true,
              mode: 'razorpay',
              order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
              },
              payment_id: service.payment_id,
              service_type: service.service_type,
              amount: amount
            });

          } catch (razorpayError) {
            console.error('Razorpay Error:', razorpayError);
            return res.status(500).json({ 
              message: 'Error creating payment order.',
              error: razorpayError.message 
            });
          }
        }

        // ===== DUMMY TEST MODE =====
        const dummyOrderId = `dummy_order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        database.run(
          'UPDATE payments SET razorpay_order_id = ? WHERE id = ?',
          [dummyOrderId, service.payment_id]
        );

        res.json({
          success: true,
          mode: 'dummy',
          order: {
            id: dummyOrderId,
            amount: Math.round(amount * 100),
            currency: 'INR'
          },
          payment_id: service.payment_id,
          service_type: service.service_type,
          company: service.company,
          amount: amount
        });
      }
    );
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify Payment (works in both REAL and DUMMY mode)
router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id, mode } = req.body;

    // ===== DUMMY TEST MODE =====
    if (mode === 'dummy' || (razorpay_order_id && razorpay_order_id.startsWith('dummy_'))) {
      const database = db.getDb();
      database.run(
        `UPDATE payments SET 
          status = 'completed', 
          razorpay_payment_id = ?, 
          razorpay_signature = ?,
          payment_method = 'razorpay_test'
        WHERE id = ?`,
        [razorpay_payment_id, 'dummy_signature_verified', payment_id],
        function(err) {
          if (err) {
            console.error('Error updating payment:', err);
            return res.status(500).json({ message: 'Error updating payment record' });
          }
          
          res.json({
            success: true,
            message: '🧪 DUMMY Payment verified successfully! (Test Mode)',
            payment_id: payment_id,
            razorpay_payment_id: razorpay_payment_id
          });
        }
      );
      return;
    }

    // ===== REAL RAZORPAY MODE =====
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const database = db.getDb();
      database.run(
        `UPDATE payments SET 
          status = 'completed', 
          razorpay_payment_id = ?, 
          razorpay_signature = ?,
          payment_method = 'razorpay'
        WHERE id = ?`,
        [razorpay_payment_id, razorpay_signature, payment_id],
        function(err) {
          if (err) {
            console.error('Error updating payment:', err);
            return res.status(500).json({ message: 'Error updating payment record' });
          }
          
          res.json({
            success: true,
            message: 'Payment verified successfully!',
            payment_id: payment_id,
            razorpay_payment_id: razorpay_payment_id
          });
        }
      );
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed. Signature mismatch.'
      });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
});

// Get user's payments
router.get('/my-payments', (req, res) => {
  const database = db.getDb();
  database.all(`
    SELECT 
      p.*,
      s.service_type,
      s.company,
      s.description,
      s.status as service_status,
      s.service_date,
      s.completed_date,
      t.name as technician_name
    FROM payments p
    JOIN services s ON p.service_id = s.id
    LEFT JOIN technicians t ON s.technician_id = t.id
    WHERE s.user_id = ?
    ORDER BY p.created_at DESC
  `, [req.user.id], (err, payments) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json({ payments });
  });
});

module.exports = router;
