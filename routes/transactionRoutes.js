const transactionController = require("../controllers/transactionController");

module.exports = async function (fastify, opts) {
  fastify.get(
    "/transaction-history/:accountId",
    transactionController.getTransactionHistory
  );
};
