const UpgradeService = require('../Services/Common.Services/Upgrade.Service');
const Crypto = require('../Utils/Crypto.Helper');
const Response = require('../Utils/Response.Helper');
const { Actions, ErrorCodes } = require('../Constants/constants');

function isMaintainer(userPubKeyHex) {
  const raw = process.env.MAINTAINER_PUBKEY;
  if (!raw || !userPubKeyHex) return false;
  const expected = raw.toLowerCase();
  return userPubKeyHex.toLowerCase() === expected;
}

class UpgradeController {
  constructor(context) {
    this.ctx = context;
  }

  async handleRequest(message) {
    const { user, readonly } = this.ctx;
    const id = message.promiseId;
    try {
      if (message.Action !== Actions.UPGRADE_CONTRACT) {
        return Response.error(ErrorCodes.UNKNOWN_ACTION, 'Unknown Upgrade action: ' + message.Action, id);
      }
      if (readonly) return Response.error(ErrorCodes.READ_ONLY, 'Upgrade requires a contract input', id);

      const pk = user.publicKey || user.pubKey;
      // 1) Handshake authentication
      if (!isMaintainer(pk)) return Response.error(ErrorCodes.UNAUTHORIZED, 'Not authorized to upgrade', id);

      const d = message.Data || {};
      if (!d.zipBase64 || !d.zipSignatureHex || d.version === undefined || d.version === null) {
        return Response.error(ErrorCodes.INVALID_REQUEST, 'zipBase64, zipSignatureHex and version are required', id);
      }
      const zipBuffer = Buffer.from(d.zipBase64, 'base64');
      // 2) Content signature authentication (Ed25519 detached)
      if (!Crypto.verifyDetached(zipBuffer, d.zipSignatureHex, process.env.MAINTAINER_PUBKEY)) {
        return Response.error(ErrorCodes.UNAUTHORIZED, 'Invalid zip signature', id);
      }
      const result = await UpgradeService.upgrade(zipBuffer, d.version, d.description);
      return Response.success(result, id);
    } catch (e) {
      return Response.error(e.code || ErrorCodes.INTERNAL, e.message, id);
    }
  }
}

module.exports = UpgradeController;
module.exports.isMaintainer = isMaintainer;
