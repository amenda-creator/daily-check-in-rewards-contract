const HotPocket = require('hotpocket-js-client');

const URL = process.env.CONTRACT_URL || 'wss://localhost:8081';

class TestClient {
  constructor() { this.promises = new Map(); this.n = 0; }

  async connect() {
    const keys = await HotPocket.generateKeys();
    this.client = await HotPocket.createClient([URL], keys);
    this.client.on(HotPocket.events.contractOutput, (r) => {
      r.outputs.forEach((o) => {
        const m = typeof o === 'string' ? JSON.parse(o) : o;
        const p = this.promises.get(m.promiseId);
        if (p) { this.promises.delete(m.promiseId); p(m); }
      });
    });
    if (!(await this.client.connect())) throw new Error('Cannot connect to ' + URL);
  }

  send(Service, Action, Data = {}) {
    const promiseId = 't' + Date.now() + '-' + (++this.n);
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Timeout')), 20000);
      this.promises.set(promiseId, (m) => { clearTimeout(t); resolve(m); });
      this.client.submitContractInput(Buffer.from(JSON.stringify({ Service, Action, Data, promiseId })));
    });
  }

  async close() { await this.client.close(); }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(label + ': expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual));
}
function assertSuccessResponse(res, label) {
  if (!res || !res.success) throw new Error(label + ': expected success, got ' + JSON.stringify(res));
}
function assertErrorResponse(res, code, label) {
  if (!res || !res.error) throw new Error(label + ': expected error, got ' + JSON.stringify(res));
  if (code) assertEqual(res.error.code, code, label + ' error code');
}

module.exports = { TestClient, assertEqual, assertSuccessResponse, assertErrorResponse };
