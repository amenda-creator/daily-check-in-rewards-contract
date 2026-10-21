const sqlite3 = require('sqlite3').verbose();
const Config = require('../../Constants/Config');

let db = null;

function open() {
  if (!db) db = new sqlite3.Database(Config.DB_PATH);
  return db;
}

function close() {
  return new Promise((resolve) => {
    if (!db) return resolve();
    db.close(() => { db = null; resolve(); });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    open().run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    open().get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    open().all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

module.exports = { open, close, run, get, all };
