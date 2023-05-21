const Account = require("../models/account");
const Transaction = require("../models/transaction.js");
const sequelize = require("../db.js");

exports.createAccount = async (req, res) => {
  try {
    const { initialBalance } = req.body;
    const parsedBalance = parseFloat(initialBalance);

    if (isNaN(parsedBalance)) {
      return res.status(400).json({ error: "Invalid initial balance." });
    }

    const account = await Account.create({ balance: parsedBalance });

    res.status(201).json({ accountId: account.id, balance: account.balance });
  } catch (error) {
    console.error("Error creating an account:", error);
    res.status(500).json({ error: "Failed to create an account." });
  }
};

exports.depositToAccount = async (req, res) => {
  try {
    const { accountId, amount } = req.body;

    const transaction = await sequelize.transaction();

    try {
      const account = await Account.findByPk(accountId, { transaction });

      if (!account) {
        await transaction.rollback();
        return res.status(404).json({ error: "Account not found." });
      }

      account.balance = Number(account.balance) + Number(amount);

      await account.save({ transaction });

      await Transaction.create(
        {
          source_account_id: null,
          destination_account_id: accountId,
          type: "deposit",
          amount,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({ balance: account.balance });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to deposit." });
  }
};

exports.withdrawMoney = async (req, res) => {
  try {
    const { accountId, amount } = req.body;

    const transaction = await sequelize.transaction();

    try {
      const account = await Account.findByPk(accountId, { transaction });

      if (!account) {
        await transaction.rollback();
        return res.status(404).json({ error: "Account not found." });
      }

      if (account.balance < amount) {
        await transaction.rollback();
        return res.status(400).json({ error: "Insufficient funds." });
      }

      account.balance -= amount;
      await account.save({ transaction });

      await Transaction.create(
        {
          source_account_id: null,
          destination_account_id: accountId,
          type: "deposit",
          amount,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({ balance: account.balance });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to deposit." });
  }
};

exports.transferMoney = async (req, res) => {
  let transaction = null;

  try {
    const { sourceAccountId, destinationAccountId, amount } = req.body;

    try {
      const transaction = await sequelize.transaction();

      const sourceAccount = await Account.findByPk(sourceAccountId, {
        transaction,
      });
      const destinationAccount = await Account.findByPk(destinationAccountId, {
        transaction,
      });

      if (!sourceAccount || !destinationAccount) {
        await transaction.rollback();
        return res.status(404).json({ error: "Account not found." });
      }

      if (sourceAccount.balance < amount) {
        await transaction.rollback();
        return res.status(400).json({ error: "Insufficient funds." });
      }

      sourceAccount.balance -= amount;
      destinationAccount.balance =
        Number(destinationAccount.balance) + Number(amount);

      await sourceAccount.save({ transaction });
      await destinationAccount.save({ transaction });

      const newTransaction = await Transaction.create(
        {
          source_account_id: sourceAccountId,
          destination_account_id: destinationAccountId,
          type: "transfer",
          amount,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        sourceAccountBalance: sourceAccount.balance,
        destinationAccountBalance: destinationAccount.balance,
      });
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  }
};

exports.getAccountBalance = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findByPk(accountId);

    if (account === null) {
      return res.status(404).json({ error: "Account not found." });
    }

    res.json({ balance: account.balance });
  } catch (error) {
    console.error("Error getting account balance:", error);
    res.status(500).json({ error: "Failed to get account balance." });
  }
};
