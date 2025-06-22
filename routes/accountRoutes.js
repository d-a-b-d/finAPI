const accountController = require("../controllers/accountController");

module.exports = async function (fastify, opts) {
  fastify.post("/create-account", accountController.createAccount);
  fastify.post("/deposit", accountController.depositToAccount);
  fastify.post("/withdraw", accountController.withdrawMoney);
  fastify.post("/transfer", accountController.transferMoney);
  fastify.get(
    "/accounts/current-balance/:accountId",
    accountController.getAccountBalance
  );
};
