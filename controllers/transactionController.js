Account = require("../models/account");
const Transaction = require("../models/transaction.js");
const { Op } = require("sequelize");

const transactionService = require("../service/transactionService");

exports.getTransactionHistory = async (request, reply) => {
  try {
    const { accountId } = request.params;
    const history = await transactionService.getTransactionHistory(accountId);
    reply.send(history);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    reply.code(500).send({
      error: "Failed to retrieve transaction history.",
      details: error.message,
    });
  }
};
