const Account = require("../models/account");
const Transaction = require("../models/transaction");
const { Op } = require("sequelize");

async function getTransactionHistory(accountId) {
  return Transaction.findAll({
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
  });
}

module.exports = {
  getTransactionHistory,
};
