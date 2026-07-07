const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Use persistent disk on Render when mounted, else local server folder
const defaultDataDir = fs.existsSync('/var/data') ? '/var/data' : __dirname;
const DB_PATH = process.env.DATABASE_PATH || path.join(defaultDataDir, 'database.sqlite');

let db;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database at', DB_PATH);
      createTables().then(resolve).catch(reject);
    });
  });
};

const createTables = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table (admin only now)
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Customers table (managed by admin)
      db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        service_type TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Add service_type column to existing customers table (if upgrading)
      db.run(`ALTER TABLE customers ADD COLUMN service_type TEXT`, () => {});

      // Technicians table (with password for login)
      db.run(`CREATE TABLE IF NOT EXISTS technicians (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT NOT NULL,
        specialization TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Add password column to existing technicians table (if upgrading)
      db.run(`ALTER TABLE technicians ADD COLUMN password TEXT`, () => {});

      // Services table
      db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL DEFAULT 1,
        customer_id INTEGER,
        customer_name TEXT,
        customer_phone TEXT,
        customer_address TEXT,
        technician_id INTEGER,
        service_type TEXT NOT NULL,
        company TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        service_date DATETIME,
        completed_date DATETIME,
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (technician_id) REFERENCES technicians(id)
      )`);

      // Add new columns to existing services table (if upgrading)
      db.run(`ALTER TABLE services ADD COLUMN customer_name TEXT`, () => {});
      db.run(`ALTER TABLE services ADD COLUMN customer_phone TEXT`, () => {});
      db.run(`ALTER TABLE services ADD COLUMN customer_address TEXT`, () => {});
      db.run(`ALTER TABLE services ADD COLUMN customer_id INTEGER`, () => {});
      db.run(`ALTER TABLE services ADD COLUMN due_date DATETIME`, () => {});

      // Payments table
      db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_type TEXT DEFAULT 'fixed',
        status TEXT DEFAULT 'pending',
        razorpay_order_id TEXT,
        razorpay_payment_id TEXT,
        razorpay_signature TEXT,
        payment_method TEXT DEFAULT 'manual',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id)
      )`);

      // Add Razorpay columns to existing payments table (if upgrading)
      db.run(`ALTER TABLE payments ADD COLUMN razorpay_order_id TEXT`, () => {});
      db.run(`ALTER TABLE payments ADD COLUMN razorpay_payment_id TEXT`, () => {});
      db.run(`ALTER TABLE payments ADD COLUMN razorpay_signature TEXT`, () => {});
      db.run(`ALTER TABLE payments ADD COLUMN payment_method TEXT DEFAULT 'manual'`, () => {});

      // Payment settings table (admin only)
      db.run(`CREATE TABLE IF NOT EXISTS payment_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_type TEXT NOT NULL,
        amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // UPI settings table (admin's UPI details for payments)
      db.run(`CREATE TABLE IF NOT EXISTS upi_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        upi_id TEXT NOT NULL,
        name TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Add UPI ID column to technicians (if upgrading)
      db.run(`ALTER TABLE technicians ADD COLUMN upi_id TEXT`, () => {});

      // Add pay_to column to payments (admin/technician)
      db.run(`ALTER TABLE payments ADD COLUMN pay_to TEXT DEFAULT 'admin'`, () => {});
      db.run(`ALTER TABLE payments ADD COLUMN upi_id TEXT`, () => {});

      // Activity Logs table (for observability & intelligence tracking)
      db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        entity_type TEXT,
        entity_id INTEGER,
        message TEXT NOT NULL,
        details TEXT,
        performed_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Add priority column to services (for smart scheduling)
      db.run(`ALTER TABLE services ADD COLUMN priority INTEGER DEFAULT 0`, () => {});
      db.run(`ALTER TABLE services ADD COLUMN assigned_by TEXT DEFAULT 'manual'`, () => {});

      // Service Reminder Settings (auto due-date after X months per service type)
      db.run(`CREATE TABLE IF NOT EXISTS reminder_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_type TEXT NOT NULL UNIQUE,
        reminder_months INTEGER NOT NULL DEFAULT 6,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Add next_due_date and reminder_auto columns to services (for auto-reminder tracking)
      db.run(`ALTER TABLE services ADD COLUMN next_due_date DATETIME`, () => {});
      db.run(`ALTER TABLE services ADD COLUMN reminder_auto INTEGER DEFAULT 0`, () => {});

      // Insert default reminder settings for common service types
      const defaultReminders = [
        ['Fridge', 6], ['AC', 6], ['Washing Machine', 6],
        ['TV', 12], ['Microwave', 12]
      ];
      defaultReminders.forEach(([type, months]) => {
        db.run(
          `INSERT OR IGNORE INTO reminder_settings (service_type, reminder_months) VALUES (?, ?)`,
          [type, months]
        );
      });

      // Final step - create default admin
      db.run(`SELECT 1`, (err) => {
        if (err) {
          reject(err);
        } else {
          createDefaultAdmin()
            .then(() => seedDemoDataIfEmpty())
            .then(resolve)
            .catch(reject);
        }
      });
    });
  });
};

const createDefaultAdmin = async () => {
  const defaultPassword = 'admin123';
  const adminEmails = ['admin@service.com', 'admin@example.com'];

  const ensureUser = (email, hash) =>
    new Promise((res, rej) => {
      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return rej(err);
        if (row) return res(false);
        db.run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          ['Admin', email, hash, 'admin'],
          (insertErr) => (insertErr ? rej(insertErr) : res(true))
        );
      });
    });

  return new Promise((resolve, reject) => {
    bcrypt.hash(defaultPassword, 10, async (err, hash) => {
      if (err) return reject(err);
      try {
        let anyCreated = false;
        for (const email of adminEmails) {
          const created = await ensureUser(email, hash);
          if (created) anyCreated = true;
        }
        if (anyCreated) {
          console.log('Default admin(s) created: admin@service.com or admin@example.com / admin123');
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
};

// Demo data for interviews — re-created automatically when DB is empty (e.g. after Render restart)
const seedDemoDataIfEmpty = async () => {
  const count = await new Promise((res, rej) => {
    db.get('SELECT COUNT(*) as count FROM services', (err, row) => (err ? rej(err) : res(row.count)));
  });
  if (count > 0) return;

  const techHash = await bcrypt.hash('tech123', 10);
  const adminId = await new Promise((res, rej) => {
    db.get('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin'], (err, row) =>
      err ? rej(err) : res(row?.id || 1)
    );
  });

  const techId = await new Promise((res, rej) => {
    db.run(
      `INSERT OR IGNORE INTO technicians (name, email, password, phone, specialization, upi_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Balaji', 'tech@service.com', techHash, '9876543210', 'AC, Cooler, and Fridge', 'balaji@upi'],
      function (err) {
        if (err) return rej(err);
        if (this.changes > 0) {
          res(this.lastID);
        } else {
          db.get('SELECT id FROM technicians WHERE email = ?', ['tech@service.com'], (e, row) =>
            e ? rej(e) : res(row.id)
          );
        }
      }
    );
  });

  const customers = [
    ['Sharth', '9972828643', 'sharth@email.com', 'Bangalore, Karnataka', 'Fridge'],
    ['Rajesh Kumar', '9988776655', 'rajesh@email.com', 'Mysore, Karnataka', 'AC'],
    ['Priya', '9123456789', 'priya@email.com', 'Bengaluru', 'Washing Machine']
  ];

  const customerIds = [];
  for (const [name, phone, email, address, serviceType] of customers) {
    const id = await new Promise((res, rej) => {
      db.run(
        'INSERT INTO customers (name, phone, email, address, service_type) VALUES (?, ?, ?, ?, ?)',
        [name, phone, email, address, serviceType],
        function (err) {
          if (err) rej(err);
          else res(this.lastID);
        }
      );
    });
    customerIds.push(id);
  }

  const services = [
    [customerIds[0], 'Sharth', '9972828643', 'Bangalore, Karnataka', 'Fridge', 'Whirlpool',
      'Annual fridge service — compressor check and gas refill', 'assigned', techId, 1200],
    [customerIds[1], 'Rajesh Kumar', '9988776655', 'Mysore, Karnataka', 'AC', 'LG',
      'AC not cooling — needs filter cleaning', 'in_progress', techId, 1500],
    [customerIds[2], 'Priya', '9123456789', 'Bengaluru', 'Washing Machine', 'Samsung',
      'Drum making noise during spin cycle', 'pending', null, 800]
  ];

  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  for (const [custId, cName, cPhone, cAddr, sType, company, desc, status, technicianId, amount] of services) {
    const serviceId = await new Promise((res, rej) => {
      db.run(
        `INSERT INTO services (user_id, customer_id, customer_name, customer_phone, customer_address,
         service_type, company, description, status, technician_id, service_date, due_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [adminId, custId, cName, cPhone, cAddr, sType, company, desc, status, technicianId,
          today.toISOString(), nextYear.toISOString()],
        function (err) {
          if (err) rej(err);
          else res(this.lastID);
        }
      );
    });

    await new Promise((res, rej) => {
      db.run(
        'INSERT INTO payments (service_id, amount, status, payment_method) VALUES (?, ?, ?, ?)',
        [serviceId, amount, status === 'assigned' ? 'pending' : 'pending', 'manual'],
        (err) => (err ? rej(err) : res())
      );
    });
  }

  // Default payment rates for demo
  const rates = [['Fridge', 1200], ['AC', 1500], ['Washing Machine', 800], ['TV', 1000]];
  for (const [type, amount] of rates) {
    await new Promise((res) => {
      db.run(
        'INSERT OR IGNORE INTO payment_settings (service_type, amount) VALUES (?, ?)',
        [type, amount],
        () => res()
      );
    });
  }

  console.log('Demo data seeded for interviews (Balaji / tech@service.com / tech123)');
};

const getDb = () => db;

const close = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
};

module.exports = {
  init,
  getDb,
  close
};
