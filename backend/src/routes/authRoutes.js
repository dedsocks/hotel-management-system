const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.staffLogin);
router.post('/guest-login', authController.guestLogin);
router.post('/guest-register', authController.guestRegister);

module.exports = router;
