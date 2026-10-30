const express = require('express');
const router = express.Router();
const housekeepingController = require('../controllers/housekeepingController');

router.get('/', housekeepingController.getHousekeepingTasks);
router.post('/', housekeepingController.createTask);
router.patch('/:id/status', housekeepingController.updateTaskStatus);

module.exports = router;
