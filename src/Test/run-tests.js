const { TestClient } = require('./test-utils');
const checkInTest = require('./TestCases/CheckInTest');
const healthTest = require('./TestCases/HealthTest');

const suites = [['Health', healthTest], ['CheckIn', checkInTest]];

(async () => {
  const client = new TestClient();
  let failed = 0;
  try {
    await client.connect();
    for (const [name, fn] of suites) {
      try { await fn(client); console.log('PASS', name); }
      catch (e) { failed++; console.error('FAIL', name, '-', e.message); }
    }
    await client.close();
  } catch (e) {
    console.error('Setup failed:', e.message);
    failed++;
  }
  process.exit(failed ? 1 : 0);
})();
