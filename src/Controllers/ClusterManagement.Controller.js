const ClusterManagementService = require('../Services/Domain.Services/ClusterManagement.Service');
const { isMaintainer } = require('./Upgrade.Controller');
const Response = require('../Utils/Response.Helper');
const { Actions, ErrorCodes } = require('../Constants/constants');

class ClusterManagementController {
  constructor(context) {
    this.ctx = context;
    this.service = new ClusterManagementService(context.hpCtx);
  }

  async handleRequest(message) {
    const { user, readonly } = this.ctx;
    const id = message.promiseId;
    const data = message.Data || {};
    try {
      switch (message.Action) {
        case Actions.GET_CLUSTER_UNL:
          return Response.success(await this.service.getClusterUnl(), id);
        case Actions.GET_CONTRACT_VERSION:
          return Response.success(await this.service.getContractVersion(), id);
        case Actions.UPDATE_CLUSTER_CONFIG:
        case Actions.UPDATE_CLUSTER_DETAILS: {
          if (readonly) return Response.error(ErrorCodes.READ_ONLY, 'Requires a contract input', id);
          if (!isMaintainer(user.publicKey || user.pubKey)) return Response.error(ErrorCodes.UNAUTHORIZED, 'Not authorized', id);
          const res = message.Action === Actions.UPDATE_CLUSTER_CONFIG
            ? await this.service.updateClusterConfig(data)
            : await this.service.updateClusterDetails(data);
          return Response.success(res, id);
        }
        default:
          return Response.error(ErrorCodes.UNKNOWN_ACTION, 'Unknown Cluster action: ' + message.Action, id);
      }
    } catch (e) {
      return Response.error(e.code || ErrorCodes.INTERNAL, e.message, id);
    }
  }
}

module.exports = ClusterManagementController;
