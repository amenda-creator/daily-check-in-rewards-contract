require('dotenv').config();
const HotPocket = require('hotpocket-nodejs-contract');
const Controller = require('./controller');
const { initDB } = require('./Data.Deploy/initDB');
const db = require('./Services/Common.Services/dbHandler');

const controller = new Controller();

const contract = async (ctx) => {
  try {
    await initDB();
    for (const user of ctx.users.list()) {
      for (const input of user.inputs) {
        const buf = await ctx.users.read(input);
        const response = await controller.handleRequest(ctx, user, buf, ctx.readonly);
        await user.send(response);
      }
    }
  } catch (e) {
    console.error('Contract execution error:', e);
  } finally {
    await db.close();
  }
};

const hpc = new HotPocket.Contract();
hpc.init(contract, HotPocket.clientProtocols.JSON, true);
