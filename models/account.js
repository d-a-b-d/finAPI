const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const Account = sequelize.define('account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  balance: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'accounts',
  timestamps: false,
});

module.exports = Account;