const { DataTypes } = require('sequelize');
const sequelize = require('../db.js'); 
const Account = require('./account.js'); // 

const Transaction = sequelize.define('transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  source_account_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Account,
      key: 'id',
    },
  },
  destination_account_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Account,
      key: 'id',
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
});

module.exports = Transaction;
