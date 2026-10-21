const fs = require('fs');
const ContractService = require('./contract-service');

async function main() {
  const [url, zipPath, privateKey, version, ...desc] = process.argv.slice(2);
  if (!url || !zipPath || !privateKey || !version) {
    console.log('Usage: node index.js <contractUrl> <zipFilePath> <privateKey> <version> <description>');
    process.exit(1);
  }
  if (!/^\d+$/.test(version)) { console.error('Version must be an integer'); process.exit(1); }
  const svc = new ContractService(url, privateKey);
  try {
    await svc.init();
    const res = await svc.upgrade(fs.readFileSync(zipPath), version, desc.join(' '));
    console.log(JSON.stringify(res, null, 2));
    await svc.close();
    process.exit(res.error ? 1 : 0);
  } catch (e) {
    console.error('Upgrade failed:', e.message);
    process.exit(1);
  }
}

main();
