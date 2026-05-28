// server/db/init.js
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Initialize database file
const db = new Database(path.join(__dirname, 'securedash.sqlite'));

// 1. Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('Viewer', 'Analyst', 'Admin')) NOT NULL,
    refresh_token TEXT
  );

  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT NOT NULL,
    value REAL NOT NULL,
    scope TEXT CHECK(scope IN ('summary', 'detailed')) NOT NULL
  );
`);

// 2. Seed Data Function
async function seed() {
  // Check if users already exist to prevent duplicate seeding
  const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (row.count > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database with test accounts...');
  const saltRounds = 10;
  const commonPassword = 'demo1234';
  const hashedPw = await bcrypt.hash(commonPassword, saltRounds);

  // Secure insertion using parameterized statements
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)');
  
  insertUser.run('viewer@demo.com', hashedPw, 'Viewer');
  insertUser.run('analyst@demo.com', hashedPw, 'Analyst');
  insertUser.run('admin@demo.com', hashedPw, 'Admin');

  // Seed sample mock metrics
  const insertMetric = db.prepare('INSERT INTO metrics (metric_name, value, scope) VALUES (?, ?, ?)');
  insertMetric.run('Active Users', 1420, 'summary');
  insertMetric.run('API Response Time (avg)', 42.5, 'summary');
  insertMetric.run('Server CPU Load', 88.2, 'detailed');
  insertMetric.run('Failed Login Attempts Log', 14, 'detailed');

  console.log('Database initialization complete.');
}

seed().catch(err => console.error('Error seeding database:', err));

module.exports = db;