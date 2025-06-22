const Account = require("../models/account");
withOptimisticRetry = require("../utils/withOptimisticRetry");
const Transaction = require("../models/transaction");
const sequelize = require("../db"); 

async function createAccount(initialBalance) {
  const parsed = parseFloat(initialBalance);
  if (isNaN(parsed)) {
    const error = new Error("Invalid initial balance.");
    error.statusCode = 400;
    throw error;
  }

  const account = await Account.create({ balance: parsed });
  return {
    accountId: account.id,
    balance: account.balance,
  };
}

module.exports = {
  createAccount,
};

async function depositToAccount(accountId, amount) {
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const error = new Error("Invalid deposit amount.");
    error.statusCode = 400;
    throw error;
  }

  return await withOptimisticRetry(async (transaction) => {
    const account = await Account.findByPk(accountId, { transaction });

    if (!account) {
      const error = new Error("Account not found.");
      error.statusCode = 404;
      throw error;
    }

    const currentBalance = parseFloat(account.balance);
    const newBalance = currentBalance + parsedAmount;

    const [updated] = await Account.update(
      { balance: newBalance },
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
        source_account_id: null,
        destination_account_id: accountId,
        type: "deposit",
        amount: parsedAmount,
      },
      { transaction }
    );

    return {
      message: "Deposit successful",
      newBalance,
    };
  });
}

module.exports = {
  depositToAccount,
};

async function withdrawMoney(accountId, amount) {
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const error = new Error("Invalid withdraw amount.");
    error.statusCode = 400;
    throw error;
  }

  return await withOptimisticRetry(async (transaction) => {
    const account = await Account.findByPk(accountId, { transaction });

    if (!account) {
      const error = new Error("Account not found.");
      error.statusCode = 404;
      throw error;
    }

    const currentBalance = parseFloat(account.balance);

    if (currentBalance < parsedAmount) {
      const error = new Error("Insufficient funds.");
      error.statusCode = 400;
      throw error;
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
}

module.exports = {
  withdrawMoney,
};


async function transferMoney(sourceAccountId, destinationAccountId, amount) {
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const error = new Error("Invalid transfer amount.");
    error.statusCode = 400;
    throw error;
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
      const error = new Error("Account not found.");
      error.statusCode = 404;
      throw error;
    }

    const sourceBalance = parseFloat(source.balance);
    const destBalance = parseFloat(dest.balance);

    if (sourceBalance < parsedAmount) {
      await transaction.rollback();
      const error = new Error("Insufficient funds.");
      error.statusCode = 400;
      throw error;
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

    return {
      message: "Transfer successful",
      newSourceBalance: source.balance,
      newDestinationBalance: dest.balance,
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
}

module.exports = {
  transferMoney,
};


async function getAccountBalance(accountId) {
  const account = await Account.findByPk(accountId);

  if (!account) {
    const error = new Error("Account not found.");
    error.statusCode = 404;
    throw error;
  }

  return { balance: account.balance };
}

module.exports = {
  getAccountBalance,
};