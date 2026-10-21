const { assertEqual, assertSuccessResponse, assertErrorResponse } = require('../test-utils');

module.exports = async function (client) {
  // Fresh client key: starts with 0 points and can check in.
  let r = await client.send('CheckIn', 'GetStatus');
  assertSuccessResponse(r, 'initial status');
  assertEqual(r.success.rewardPoints, 0, 'initial points');
  assertEqual(r.success.canCheckInToday, true, 'initial canCheckIn');

  r = await client.send('CheckIn', 'CheckIn');
  assertSuccessResponse(r, 'first check-in');
  assertEqual(r.success.rewardPoints, 1, 'points after check-in');
  assertEqual(r.success.checkedInToday, true, 'checkedInToday');

  r = await client.send('CheckIn', 'CheckIn');
  assertErrorResponse(r, 'ALREADY_CHECKED_IN', 'second check-in same day');

  r = await client.send('CheckIn', 'GetStatus');
  assertSuccessResponse(r, 'status after');
  assertEqual(r.success.rewardPoints, 1, 'points unchanged');
  assertEqual(r.success.canCheckInToday, false, 'canCheckIn after');

  r = await client.send('CheckIn', 'Nope');
  assertErrorResponse(r, 'UNKNOWN_ACTION', 'unknown action');
};
