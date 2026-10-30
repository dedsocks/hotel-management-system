const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const analyticsController = require('../controllers/analyticsController');

router.get('/staff', staffController.getAllStaff);
router.get('/guests', staffController.getAllGuests);
router.get('/invoices', staffController.getAllInvoices);
router.get('/analytics', analyticsController.getAnalytics);

module.exports = router;
