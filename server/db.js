
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'voluntarios.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const setupDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('super_admin', 'org_admin', 'volunteer')),
      email_verified INTEGER DEFAULT 0,
      org_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      contact_email TEXT UNIQUE NOT NULL,
      logo_path TEXT,
      description TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'disabled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      total_slots INTEGER NOT NULL,
      remaining_slots INTEGER NOT NULL,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'closed', 'full')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      volunteer_id INTEGER NOT NULL,
      opportunity_id INTEGER NOT NULL,
      status TEXT DEFAULT 'registered' CHECK(status IN ('registered', 'completed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(volunteer_id, opportunity_id),
      FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Seed default super admin
  const bcrypt = require('bcryptjs');
  const superAdminEmail = 'admin@voluntarios.com';
  const superAdminPassword = 'admin123';
  const hashedPassword = bcrypt.hashSync(superAdminPassword, 10);

  const superAdminExists = db.prepare('SELECT id FROM users WHERE email = ?').get(superAdminEmail);
  if (!superAdminExists) {
    db.prepare('INSERT INTO users (email, password_hash, role, email_verified) VALUES (?, ?, ?, ?)').run(
      superAdminEmail,
      hashedPassword,
      'super_admin',
      1 // Email verified
    );
    console.log('Default super admin created.');
  }
};

setupDatabase();

module.exports = db;
