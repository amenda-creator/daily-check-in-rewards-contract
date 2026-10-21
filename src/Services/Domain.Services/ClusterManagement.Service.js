const UpgradeService = require('../Common.Services/Upgrade.Service');

class ClusterManagementService {
  constructor(hpContext) {
    this.hpCtx = hpContext;
  }

  async getClusterUnl() {
    const unl = this.hpCtx && this.hpCtx.unl ? this.hpCtx.unl : null;
    const list = unl && typeof unl.list === 'function' ? unl.list().map((n) => n.publicKey) : [];
    return { unl: list };
  }

  async getContractVersion() {
    return { version: await UpgradeService.getCurrentVersion() };
  }

  async updateClusterConfig(data) {
    if (!data || !Array.isArray(data.unl) || data.unl.length === 0) throw new Error('Data.unl (non-empty array of public keys) is required');
    if (!this.hpCtx || typeof this.hpCtx.getConfig !== 'function' || typeof this.hpCtx.updateConfig !== 'function') {
      throw new Error('Config update is not supported in this context');
    }
    const cfg = await this.hpCtx.getConfig();
    cfg.unl = data.unl;
    if (Array.isArray(data.peers)) cfg.mesh = Object.assign({}, cfg.mesh, { known_peers: data.peers });
    await this.hpCtx.updateConfig(cfg);
    return { updated: true, unl: cfg.unl };
  }

  async updateClusterDetails(data) {
    if (!data || !Array.isArray(data.peers)) throw new Error('Data.peers (array of "host:port") is required');
    if (!this.hpCtx || typeof this.hpCtx.getConfig !== 'function' || typeof this.hpCtx.updateConfig !== 'function') {
      throw new Error('Config update is not supported in this context');
    }
    const cfg = await this.hpCtx.getConfig();
    cfg.mesh = Object.assign({}, cfg.mesh, { known_peers: data.peers });
    await this.hpCtx.updateConfig(cfg);
    return { updated: true, peers: data.peers };
  }
}

module.exports = ClusterManagementService;
