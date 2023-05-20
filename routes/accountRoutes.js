const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.post('/create-account', accountController.createAccount);

router.post('/deposit', accountController.depositToAccount);

router.post('/withdraw', accountController.withdrawMoney);

router.post('/transfer', accountController.transferMoney);

router.get('/accounts/current-balance/:accountId', accountController.getAccountBalance);

module.exports = router;


