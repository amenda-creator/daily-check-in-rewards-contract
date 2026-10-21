// Deterministic, side-effect-free health check. No auth, no DB, no time, no randomness.
class HealthController {
  constructor(context) {
    this.ctx = context;
  }

  async handleRequest(message) {
    return { success: { status: 'healthy' }, promiseId: message.promiseId };
  }
}

module.exports = HealthController;
