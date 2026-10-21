const CheckInService = require('../Services/Domain.Services/CheckIn.Service');
const Response = require('../Utils/Response.Helper');
const { Actions, ErrorCodes } = require('../Constants/constants');

class CheckInController {
  constructor(context) {
    this.ctx = context; // { user, now, readonly }
  }

  async handleRequest(message) {
    const { user, now, readonly } = this.ctx;
    const pk = user.publicKey || user.pubKey;
    try {
      switch (message.Action) {
        case Actions.CHECK_IN:
          if (readonly) return Response.error(ErrorCodes.READ_ONLY, 'Check-in must be submitted as a contract input', message.promiseId);
          return Response.success(await CheckInService.checkIn(pk, now), message.promiseId);
        case Actions.GET_STATUS:
          return Response.success(await CheckInService.getStatus(pk, now), message.promiseId);
        default:
          return Response.error(ErrorCodes.UNKNOWN_ACTION, 'Unknown CheckIn action: ' + message.Action, message.promiseId);
      }
    } catch (e) {
      return Response.error(e.code || ErrorCodes.INTERNAL, e.message, message.promiseId);
    }
  }
}

module.exports = CheckInController;
