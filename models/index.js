"use strict";

const Sequelize = require("sequelize");
const config = require("../config")[process.env.NODE_ENV || "development"];

// Initialize Sequelize instance with Postgres
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: "postgres",
    logging: false,
  }
);

// Import models manually (since they use sequelize.define)
const Account = require("./account");
const Transaction = require("./transaction");

// Set up DB object for exporting
const db = {
  sequelize,
  Sequelize,
  Account,
  Transaction,
};

module.exports = db;
