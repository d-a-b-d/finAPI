const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const { Sequelize } = require("sequelize");
const Account = require("./account.js");

const Transaction = sequelize.define(
  "transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    source_account_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Account,
        key: "id",
      },
    },
    destination_account_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Account,
        key: "id",
      },
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    amount: {
      type: DataTypes.NUMERIC(10, 2),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: Sequelize.DATE,
      field: "created_at",
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: "updated_at",
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    indexes: [
      { fields: ["source_account_id"] },
      { fields: ["destination_account_id"] },
      { fields: ["timestamp"] },
    ],
  }
);

Transaction.belongsTo(Account, {
  as: "sourceAccount",
  foreignKey: "source_account_id",
});
Transaction.belongsTo(Account, {
  as: "destinationAccount",
  foreignKey: "destination_account_id",
});

module.exports = Transaction;
