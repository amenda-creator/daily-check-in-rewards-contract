const nacl = require('tweetnacl');

// HotPocket public keys are 'ed' + 64 hex chars. Strip the prefix to get raw Ed25519 bytes.
function hpKeyToBytes(hex) {
  let h = String(hex || '').toLowerCase();
  if (h.length === 66 && h.startsWith('ed')) h = h.slice(2);
  if (h.length !== 64 || !/^[0-9a-f]+$/.test(h)) return null;
  return Uint8Array.from(Buffer.from(h, 'hex'));
}

function verifyDetached(messageBuffer, signatureHex, publicKeyHex) {
  try {
    const pk = hpKeyToBytes(publicKeyHex);
    if (!pk || !/^[0-9a-fA-F]{128}$/.test(String(signatureHex || ''))) return false;
    const sig = Uint8Array.from(Buffer.from(signatureHex, 'hex'));
    return nacl.sign.detached.verify(Uint8Array.from(messageBuffer), sig, pk);
  } catch (e) {
    return false;
  }
}

module.exports = { hpKeyToBytes, verifyDetached };
