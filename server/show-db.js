const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const tables = [
  'users',
  'customers',
  'technicians',
  'services',
  'payments',
  'payment_settings',
  'upi_settings',
  'reminder_settings',
  'activity_logs'
];

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

(async () => {
  console.log('=== DATABASE FILE ===');
  console.log(dbPath);
  console.log('');

  for (const table of tables) {
    try {
      const [{ c }] = await all(`SELECT COUNT(*) as c FROM ${table}`);
      console.log(`--- ${table.toUpperCase()} (${c} rows) ---`);

      if (c === 0) {
        console.log('(empty)\n');
        continue;
      }

      const rows = await all(`SELECT * FROM ${table} LIMIT 5`);
      rows.forEach((row, i) => {
        const safe = { ...row };
        if (safe.password) safe.password = '[HASHED - hidden]';
        console.log(`${i + 1}.`, JSON.stringify(safe));
      });

      if (c > 5) console.log(`... and ${c - 5} more row(s)`);
      console.log('');
    } catch (err) {
      console.log(`(error: ${err.message})\n`);
    }
  }

  db.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
