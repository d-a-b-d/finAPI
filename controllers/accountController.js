const Transaction = require("../models/transaction.js");
const sequelize = require("../db.js");
const withOptimisticRetry = require("../utils/withOptimisticRetry");
const accountService = require("../service/accountService");

exports.createAccount = async (request, reply) => {
  try {
    const { initialBalance } = request.body
    const result = await accountService.createAccount(initialBalance)
    reply.code(201).send(result);

  } catch (error) {
    console.error("Error creating account:", error);
    const status = error.statusCode || 500;
    reply.code(status).send({
      error: error.message ||  "Failed to create an account.",
    });
  }
};

exports.depositToAccount = async (request, reply) => {
  try {
    const { accountId, amount } = request.body;
    const result = await accountService.depositToAccount(accountId, amount);
    reply.code(200).send(result);
  } catch (error) {
    console.error("Deposit failed:", error);
    const status = error.statusCode || 500;
    reply.code(status).send({ error: error.message });
  }
};


exports.withdrawMoney = async (request, reply) => {
  try {
    const { accountId, amount } = request.body;
    const result = await accountService.withdrawMoney(accountId, amount);
    reply.code(200).send(result);
  } catch (error) {
    console.error("Withdraw failed:", error);
    const status = error.statusCode || 500;
    reply.code(status).send({ error: error.message });
  }
};


exports.transferMoney = async (request, reply) => {
  try {
    const { sourceAccountId, destinationAccountId, amount } = request.body;
    const result = await accountService.transferMoney(
      sourceAccountId,
      destinationAccountId,
      amount
    );
    reply.code(200).send(result);
  } catch (error) {
    console.error("Transfer failed:", error);
    const status = error.statusCode || 500;
    reply.code(status).send({ error: error.message });
  }
};

exports.getAccountBalance = async (request, reply) => {
  try {
    const { accountId } = request.params;
    const result = await accountService.getAccountBalance(accountId);
    reply.code(200).send(result);
  } catch (error) {
    console.error("Balance check failed:", error);
    const status = error.statusCode || 500;
    reply.code(status).send({ error: error.message });
  }
};