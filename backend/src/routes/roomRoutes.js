const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/', roomController.getAllRooms);
router.patch('/:id/housekeeping', roomController.updateHousekeepingStatus);
router.get('/types', roomController.getRoomTypes);
router.get('/branches', roomController.getBranches);

module.exports = router;
