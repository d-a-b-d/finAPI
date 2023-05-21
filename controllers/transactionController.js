const Account = require('../models/account');
const Transaction = require('../models/transaction.js');
const sequelize = require('../db.js');
const { Op } = require("sequelize");

exports.getTransactionHistory = async (req, res) => {
  try {
    const { accountId } = req.params;

    const transaction = await sequelize.transaction();

    try {
      const transactionHistory = await Transaction.findAll({
        where: {
          [Op.or]: [
            { source_account_id: accountId },
            { destination_account_id: accountId },
          ],
        },
        include: [
          { model: Account, as: "sourceAccount" },
          { model: Account, as: "destinationAccount" },
        ],
        order: [["timestamp", "DESC"]],
        transaction, 
      });

      await transaction.commit();

      res.json(transactionHistory);
    } catch (error) {
      await transaction.rollback();

      console.log(error);
      console.error("Failed to retrieve transaction history:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve transaction history." });
    }
  } catch (error) {
    console.error("Error starting transaction:", error);
    res.status(500).json({ error: "Failed to start transaction." });
  }
};

