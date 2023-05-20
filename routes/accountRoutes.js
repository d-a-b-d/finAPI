const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.post('/accounts', accountController.createAccount);

module.exports = router;