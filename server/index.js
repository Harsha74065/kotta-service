const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
const db = require('./database');

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/technician', require('./routes/technician'));
app.use('/api/payment', require('./routes/payment'));

// ---------- PRODUCTION: Serve React Build ----------
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build folder
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

  // For any route that is NOT an API route, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

// Initialize database and start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      console.log('Serving React build in production mode');
    }
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  // Start server anyway even if DB has issues
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (DB init had issues)`);
  });
});
