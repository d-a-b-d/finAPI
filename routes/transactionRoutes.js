const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/transaction-history/:accountId", transactionController.getTransactionHistory);

module.exports = router;
