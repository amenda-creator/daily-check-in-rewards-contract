const { ServiceTypes, ErrorCodes } = require('./Constants/constants');
const Response = require('./Utils/Response.Helper');
const CheckInController = require('./Controllers/CheckIn.Controller');
const UpgradeController = require('./Controllers/Upgrade.Controller');
const ClusterManagementController = require('./Controllers/ClusterManagement.Controller');
const HealthController = require('./Controllers/Health.Controller');

class Controller {
  // Parses one input buffer, routes to the right controller, returns the response object.
  async handleRequest(hpCtx, user, buffer, readonly) {
    let message;
    try {
      message = JSON.parse(buffer.toString('utf8'));
    } catch (e) {
      return Response.error(ErrorCodes.INVALID_REQUEST, 'Input must be valid JSON');
    }
    if (!message || typeof message !== 'object') {
      return Response.error(ErrorCodes.INVALID_REQUEST, 'Input must be a JSON object');
    }

    const promiseId = message.promiseId;
    const context = {
      hpCtx: hpCtx,
      user: user,
      readonly: !!readonly,
      now: typeof hpCtx.timestamp === 'number' ? hpCtx.timestamp : Date.now()
    };

    let controller;
    switch (message.Service) {
      case ServiceTypes.HEALTH: controller = new HealthController(context); break;
      case ServiceTypes.CHECKIN: controller = new CheckInController(context); break;
      case ServiceTypes.UPGRADE: controller = new UpgradeController(context); break;
      case ServiceTypes.CLUSTER: controller = new ClusterManagementController(context); break;
      default:
        return Response.error(ErrorCodes.UNKNOWN_SERVICE, 'Unknown service: ' + message.Service, promiseId);
    }

    try {
      const result = await controller.handleRequest(message);
      console.log('[' + message.Service + '/' + message.Action + '] handled');
      return result;
    } catch (e) {
      return Response.error(ErrorCodes.INTERNAL, e.message, promiseId);
    }
  }
}

module.exports = Controller;
