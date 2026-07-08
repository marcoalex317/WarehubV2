const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'warehub.db');

let db = null;

async function getDatabase() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA foreign_keys=ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL CHECK(role IN ('tenant', 'owner')),
      phone      TEXT    DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id    INTEGER NOT NULL,
      name        TEXT    NOT NULL,
      location    TEXT    NOT NULL,
      address     TEXT    DEFAULT '',
      size        INTEGER NOT NULL,
      price       INTEGER NOT NULL,
      description TEXT    DEFAULT '',
      image       TEXT    DEFAULT '',
      facilities  TEXT    DEFAULT '[]',
      available   INTEGER DEFAULT 1,
      rating      REAL    DEFAULT 0,
      reviews     INTEGER DEFAULT 0,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id    INTEGER NOT NULL,
      warehouse_id INTEGER NOT NULL,
      start_date   TEXT    NOT NULL,
      end_date     TEXT    NOT NULL,
      days         INTEGER NOT NULL,
      total_price  INTEGER NOT NULL,
      status       TEXT    DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'done', 'cancelled')),
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id)    REFERENCES users(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    )
  `);

  saveDatabase();
  console.log('  Database siap! File:', DB_PATH);
  return db;
}

function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

module.exports = { getDatabase, saveDatabase };
