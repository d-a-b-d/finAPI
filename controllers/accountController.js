const Account = require('../models/account');
const Transaction = require('../models/transaction');

exports.createAccount = async (req, res) => {
  try {
    const { initialBalance } = req.body;
    console.log('Logging!');

    const account = await Account.create({ balance: initialBalance });

    res.status(201).json({ accountId: account.id, balance: account.balance });
  } catch (error) {
    console.error('Error creating an account:', error);
    res.status(500).json({ error: 'Failed to create an account.' });
  }
};

const { Transaction, Account } = require('../models');

exports.depositToAccount = async (req, res) => {
  try {
    const { accountId, amount } = req.body;

    const transaction = await sequelize.transaction();

    try {
      const account = await Account.findByPk(accountId, { transaction });

      if (!account) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Account not found.' });
      }

      account.balance += amount;
      await account.save({ transaction });

      await Transaction.create({
        source_account_id: null,
        destination_account_id: accountId,
        type: 'deposit',
        amount,
      }, { transaction });

      await transaction.commit();

      res.json({ balance: account.balance });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to deposit.' });
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
          return res.status(404).json({ error: 'Account not found.' });
        }
  
        account.balance -= amount;
        await account.save({ transaction });
  
        await Transaction.create({
          source_account_id: null,
          destination_account_id: accountId,
          type: 'deposit',
          amount,
        }, { transaction });
  
        await transaction.commit();
  
        res.json({ balance: account.balance });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to deposit.' });
    }
  };

exports.transferMoney = async (req, res) => {
    try {

        const { sourceAccountId, destinationAccountId, amount } = req.body;
       
        const transaction = await sequelize.transaction();

        try {

          const sourceAccount = await Account.findByPk(sourceAccountId, { transaction });
          const destinationAccount = await Account.findByPk(destinationAccount, { transaction });

          if (!sourceAccount || !destinationAccount) {
              await transaction.rollback();
              return res.status(404).json({ error: 'Account not found.' });
          }

          if (sourceAccount.balance < amount) {
              await transaction.rollback();
              return res.status(404).json({ error: "Insufficient funds."})
          }

          sourceAccount.balance -= amount;
          destinationAccount.balance += amount;

          await sourceAccount.balance({ transaction });
          await destinationAccount.save({ transaction });

          const newTransaction = await Transaction.create({
              source_account_id: fromAccountId,
              destination_account_id: toAccountId,
              type: 'transfer',
              amount,
            }, { transaction });

          await transaction.commit();

          res.json({ sourceAccountBalance: sourceAccount.balance, destinationAccountBalance: destinationAccount.balance });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
