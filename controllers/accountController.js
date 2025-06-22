const Account = require("../models/account");
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
  const { accountId, amount } = request.body;
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return reply.code(400).send({ error: "Invalid withdraw amount." });
  }

  try {
    const result = await withOptimisticRetry(async (transaction) => {
      const account = await Account.findByPk(accountId, { transaction });

      if (!account) {
        return reply.code(404).send({ error: "Account not found." });
      }

      const currentBalance = parseFloat(account.balance);
      if (currentBalance < parsedAmount) {
        return reply.code(400).send({ error: "Insufficient funds." });
      }

      const [updated] = await Account.update(
        { balance: currentBalance - parsedAmount },
        {
          where: { id: accountId, balance: currentBalance },
          transaction,
        }
      );

      if (updated === 0) {
        throw new Error("Concurrent modification detected");
      }

      await Transaction.create(
        {
          source_account_id: accountId,
          destination_account_id: null,
          type: "withdraw",
          amount: parsedAmount,
        },
        { transaction }
      );

      return {
        message: "Withdrawal successful",
        newBalance: currentBalance - parsedAmount,
      };
    });

    reply.code(200).send(result);
  } catch (error) {
    console.error("Withdraw failed:", error);
    reply.code(500).send({ error: "Failed to complete withdrawal." });
  }
};

exports.transferMoney = async (request, reply) => {
  const { sourceAccountId, destinationAccountId, amount } = request.body;
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return reply.code(400).send({ error: "Invalid transfer amount." });
  }

  const transaction = await sequelize.transaction();

  try { 
    const source = await Account.findOne({
      where: { id: sourceAccountId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const dest = await Account.findOne({
      where: { id: destinationAccountId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!source || !dest) {
      await transaction.rollback();
      return reply.code(404).send({ error: "Account not found." });
    }

    const sourceBalance = parseFloat(source.balance);
    const destBalance = parseFloat(dest.balance);

    if (sourceBalance < parsedAmount) {
      await transaction.rollback();
      return reply.code(400).send({ error: "Insufficient funds." });
    }

    source.balance = sourceBalance - parsedAmount;
    dest.balance = destBalance + parsedAmount;

    await source.save({ transaction });
    await dest.save({ transaction });

    await Transaction.create(
      {
        source_account_id: sourceAccountId,
        destination_account_id: destinationAccountId,
        type: "transfer",
        amount: parsedAmount,
      },
      { transaction }
    );

    await transaction.commit();

    return reply.code(200).send({
      message: "Transfer successful",
      newSourceBalance: source.balance,
      newDestinationBalance: dest.balance,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Transfer failed:", error);
    return reply.code(500).send({ error: "Failed to complete transfer." });
  }
};
exports.getAccountBalance = async (request, reply) => {
  try {
    const { accountId } = request.params;
    const account = await Account.findByPk(accountId);

    if (!account) {
      return reply.code(404).send({ error: "Account not found." });
    }

    reply.send({ balance: account.balance });
  } catch (error) {
    console.error("Error getting account balance:", error);
    reply.code(500).send({ error: "Failed to get account balance." });
  }
};
