const Account = require('../models/account');

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
