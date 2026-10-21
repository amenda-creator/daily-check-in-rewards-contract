const db = require('../Common.Services/dbHandler');
const Config = require('../../Constants/Config');
const { Tables, ErrorCodes } = require('../../Constants/constants');

class CheckInService {
  // Day index is derived from the consensus timestamp (UTC days since epoch) so all nodes agree.
  static dayOf(timestampMs) {
    return Math.floor(timestampMs / Config.DAY_LENGTH_MS);
  }

  static buildStatus(row, now) {
    const today = CheckInService.dayOf(now);
    const last = row && row.LastCheckInDay !== null && row.LastCheckInDay !== undefined ? row.LastCheckInDay : null;
    const checkedInToday = last === today;
    return {
      rewardPoints: row ? row.RewardPoints : 0,
      lastCheckInDay: last,
      lastCheckInDate: last === null ? null : new Date(last * Config.DAY_LENGTH_MS).toISOString().slice(0, 10),
      checkedInToday: checkedInToday,
      canCheckInToday: !checkedInToday,
      currentDay: today,
      nextCheckInAt: checkedInToday ? (today + 1) * Config.DAY_LENGTH_MS : null
    };
  }

  static async getStatus(userPubKey, now) {
    const row = await db.get(`SELECT * FROM ${Tables.CheckInUsers} WHERE UserPubKey = ?`, [userPubKey]);
    return CheckInService.buildStatus(row, now);
  }

  static async checkIn(userPubKey, now) {
    const today = CheckInService.dayOf(now);
    const row = await db.get(`SELECT * FROM ${Tables.CheckInUsers} WHERE UserPubKey = ?`, [userPubKey]);

    if (row && row.LastCheckInDay === today) {
      const err = new Error('Already checked in today. Come back tomorrow (UTC).');
      err.code = ErrorCodes.ALREADY_CHECKED_IN;
      throw err;
    }

    if (!row) {
      await db.run(`INSERT INTO ${Tables.CheckInUsers} (UserPubKey, RewardPoints, LastCheckInDay, LastCheckInTimestamp) VALUES (?, ?, ?, ?)`,
        [userPubKey, Config.POINTS_PER_CHECK_IN, today, now]);
    } else {
      await db.run(`UPDATE ${Tables.CheckInUsers} SET RewardPoints = RewardPoints + ?, LastCheckInDay = ?, LastCheckInTimestamp = ?, LastUpdatedOn = CURRENT_TIMESTAMP WHERE UserPubKey = ?`,
        [Config.POINTS_PER_CHECK_IN, today, now, userPubKey]);
    }
    await db.run(`INSERT INTO ${Tables.CheckInHistory} (UserPubKey, CheckInDay, CheckInTimestamp) VALUES (?, ?, ?)`, [userPubKey, today, now]);

    const status = await CheckInService.getStatus(userPubKey, now);
    status.message = 'Check-in successful. +' + Config.POINTS_PER_CHECK_IN + ' reward point.';
    return status;
  }
}

module.exports = CheckInService;
