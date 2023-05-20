const request = require('supertest');
const app = require('../app.js');

test('createAccount should create a new account and return the account ID and balance', async () => {
    const initialBalance = 1000;
    const response = await request(app)
      .post('/accounts/accounts')
      .send({ initialBalance });
  
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accountId');
    expect(response.body).toHaveProperty('balance');
  
    // Add a small delay before completing the test
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  
exports.depositToAccount = async (req, res) => {
  try {
    const { accountId, amount } = req.body;

    const account = await Account.findByPk(accountId);

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    account.balance += amount;
    await account.save();

    res.json({ balance: account.balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deposit.' });
  }
};

exports.withdrawFromAccount = async (req, res) => {
  try {
    const { accountId, amount } = req.body;

    const account = await Account.findByPk(accountId);

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance.' });
    }

    account.balance -= amount;
    await account.save();

    res.json({ balance: account.balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to withdraw.' });
  }
};


exports.transferMoney = async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount } = req.body;

    const transaction = await sequelize.transaction();

    const fromAccount = await Account.findByPk(fromAccountId, { transaction });
    const toAccount = await Account.findByPk(toAccountId, { transaction });

    if (!fromAccount || !toAccount) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (fromAccount.balance < amount) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Insufficient balance.' });
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save({ transaction });
    await toAccount.save({ transaction });

    await transaction.commit();

    res.json({ fromAccountBalance: fromAccount.balance, toAccountBalance: toAccount.balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to transfer money.' });
  }
};

exports.getAccountBalance = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findByPk(accountId);

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    res.json({ balance: account.balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get account balance.' });
  }
};

  