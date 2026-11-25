const express = require('express');
const router = express.Router();
const diningController = require('../controllers/diningController');

router.get('/menu', diningController.getMenuItems);
router.get('/orders', diningController.getFoodOrders);
router.post('/orders', diningController.createFoodOrder);
router.patch('/orders/:id/status', diningController.updateFoodOrderStatus);

module.exports = router;
