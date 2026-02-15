import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'incidents.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

db.configure('busyTimeout', 5000);

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS incidents (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          service TEXT NOT NULL,
          severity TEXT NOT NULL CHECK(severity IN ('SEV1', 'SEV2', 'SEV3', 'SEV4')),
          status TEXT NOT NULL CHECK(status IN ('OPEN', 'MITIGATED', 'RESOLVED')),
          owner TEXT,
          summary TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )`,
        (err) => {
          if (err) reject(err);
          else {
            // Create indices for better query performance
            db.run('CREATE INDEX IF NOT EXISTS idx_service ON incidents(service)', (err) => {
              if (err) console.warn('Index creation warning:', err);
            });
            db.run('CREATE INDEX IF NOT EXISTS idx_status ON incidents(status)', (err) => {
              if (err) console.warn('Index creation warning:', err);
            });
            db.run('CREATE INDEX IF NOT EXISTS idx_severity ON incidents(severity)', (err) => {
              if (err) console.warn('Index creation warning:', err);
            });
            db.run('CREATE INDEX IF NOT EXISTS idx_createdAt ON incidents(createdAt)', (err) => {
              if (err) console.warn('Index creation warning:', err);
              resolve();
            });
          }
        }
      );
    });
  });
}

export function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
