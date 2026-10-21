const db = require('../Services/Common.Services/dbHandler');
const { Tables } = require('../Constants/constants');

async function initDB() {
  await db.run(`CREATE TABLE IF NOT EXISTS ${Tables.ContractVersion} (
      Id INTEGER,
      Version INTEGER NOT NULL,
      Description TEXT,
      CreatedOn DATETIME DEFAULT CURRENT_TIMESTAMP,
      LastUpdatedOn DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY("Id" AUTOINCREMENT)
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS ${Tables.CheckInUsers} (
      UserPubKey TEXT PRIMARY KEY,
      RewardPoints INTEGER NOT NULL DEFAULT 0,
      LastCheckInDay INTEGER,
      LastCheckInTimestamp INTEGER,
      CreatedOn DATETIME DEFAULT CURRENT_TIMESTAMP,
      LastUpdatedOn DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS ${Tables.CheckInHistory} (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      UserPubKey TEXT NOT NULL,
      CheckInDay INTEGER NOT NULL,
      CheckInTimestamp INTEGER NOT NULL,
      UNIQUE (UserPubKey, CheckInDay),
      FOREIGN KEY (UserPubKey) REFERENCES ${Tables.CheckInUsers}(UserPubKey)
  )`);

  const row = await db.get(`SELECT COUNT(*) AS c FROM ${Tables.ContractVersion}`);
  if (!row || row.c === 0) {
    await db.run(`INSERT INTO ${Tables.ContractVersion} (Version, Description) VALUES (?, ?)`, [1, 'Initial version']);
  }
}

module.exports = { initDB };
