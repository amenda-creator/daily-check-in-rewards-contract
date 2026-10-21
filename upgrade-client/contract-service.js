const HotPocket = require('hotpocket-js-client');
const nacl = require('tweetnacl');

class ContractService {
  constructor(url, privateKeyHex) {
    this.url = url;
    this.privateKeyHex = privateKeyHex;
    this.client = null;
    this.keys = null;
    this.promises = new Map();
    this.counter = 0;
  }

  async init() {
    this.keys = await HotPocket.generateKeys(this.privateKeyHex);
    this.client = await HotPocket.createClient([this.url], this.keys);
    this.client.on(HotPocket.events.contractOutput, (r) => {
      r.outputs.forEach((o) => {
        let msg = o;
        if (typeof o === 'string') { try { msg = JSON.parse(o); } catch (e) { return; } }
        const p = msg && this.promises.get(msg.promiseId);
        if (p) { this.promises.delete(msg.promiseId); p.resolve(msg); }
      });
    });
    if (!(await this.client.connect())) throw new Error('Connection failed');
  }

  sign(buffer) {
    const sig = typeof this.client.sign === 'function'
      ? this.client.sign(buffer)
      : nacl.sign.detached(Uint8Array.from(buffer), Uint8Array.from(this.keys.privateKey));
    return Buffer.from(sig).toString('hex');
  }

  send(service, action, data, timeoutMs = 30000) {
    const promiseId = 'p' + Date.now() + '-' + (++this.counter);
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => { this.promises.delete(promiseId); reject(new Error('Timed out')); }, timeoutMs);
      this.promises.set(promiseId, { resolve: (v) => { clearTimeout(t); resolve(v); } });
      const payload = { Service: service, Action: action, Data: data, promiseId };
      this.client.submitContractInput(Buffer.from(JSON.stringify(payload)));
    });
  }

  upgrade(zipBuffer, version, description) {
    return this.send('Upgrade', 'UpgradeContract', {
      zipBase64: zipBuffer.toString('base64'),
      zipSignatureHex: this.sign(zipBuffer),
      version: parseInt(version, 10),
      description: description
    });
  }

  async close() { if (this.client) await this.client.close(); }
}

module.exports = ContractService;
