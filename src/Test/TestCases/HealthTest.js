const { assertEqual, assertSuccessResponse } = require('../test-utils');

module.exports = async function (client) {
  const r = await client.send('Health', 'HealthCheck');
  assertSuccessResponse(r, 'health');
  assertEqual(r.success.status, 'healthy', 'status');
};
