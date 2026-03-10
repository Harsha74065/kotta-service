const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// ---------- Serve React Build (ALWAYS if build exists) ----------
const buildPath = path.join(__dirname, '..', 'client', 'build');

if (fs.existsSync(buildPath)) {
  console.log('React build folder found — serving static files');
  // Serve static files from the React app build folder
  app.use(express.static(buildPath));

  // For any route that is NOT an API route, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.log('No React build folder found — API-only mode');
  app.get('/', (req, res) => {
    res.json({ message: 'KottA Service API is running! Build the client to see the website.' });
  });
}

// Initialize database and start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (DB init had issues)`);
  });
});
