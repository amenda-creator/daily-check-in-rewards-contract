// Utility: removes all check-in data (keeps ContractVersion). Run: node cleanup.js
require('dotenv').config();
const db = require('../../Services/Common.Services/dbHandler');
const { Tables } = require('../../Constants/constants');

(async () => {
  try {
    await db.run(`DELETE FROM ${Tables.CheckInHistory}`);
    await db.run(`DELETE FROM ${Tables.CheckInUsers}`);
    console.log('Check-in data cleaned up.');
  } catch (e) {
    console.error('Cleanup failed:', e.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
})();
