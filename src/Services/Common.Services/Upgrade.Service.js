const fs = require('fs');
const path = require('path');
const db = require('./dbHandler');
const { Tables } = require('../../Constants/constants');

class UpgradeService {
  static async getCurrentVersion() {
    const row = await db.get(`SELECT Version FROM ${Tables.ContractVersion} ORDER BY Id DESC LIMIT 1`);
    return row ? parseInt(row.Version, 10) : 1;
  }

  static async upgrade(zipBuffer, version, description) {
    const incoming = parseInt(version, 10);
    if (!Number.isInteger(incoming) || String(incoming) !== String(version).trim()) {
      throw new Error('Version must be an integer');
    }
    const current = await UpgradeService.getCurrentVersion();
    if (incoming <= current) {
      throw new Error('Incoming version ' + incoming + ' must be greater than current version ' + current);
    }

    const zipPath = path.resolve('newContractData.zip');
    fs.writeFileSync(zipPath, zipBuffer);

    const script = '#!/bin/bash\n' +
      '! command -v unzip &>/dev/null && apt-get update && apt-get install --no-install-recommends -y unzip\n' +
      'unzip -o -d ./ "newContractData.zip"\n' +
      'rm "newContractData.zip"\n';
    fs.writeFileSync(path.resolve('post_exec.sh'), script, { mode: 0o777 });

    await db.run(`INSERT INTO ${Tables.ContractVersion} (Version, Description) VALUES (?, ?)`, [incoming, description || '']);
    return { version: incoming, previousVersion: current, message: 'Upgrade staged; contract will update after this round.' };
  }
}

module.exports = UpgradeService;
