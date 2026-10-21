const settings = require('../settings.json');

module.exports = {
  APP_NAME: settings.appName,
  DAY_LENGTH_MS: settings.dayLengthMs,
  POINTS_PER_CHECK_IN: settings.pointsPerCheckIn,
  DB_PATH: process.env.DB_PATH || settings.dbFile
};
