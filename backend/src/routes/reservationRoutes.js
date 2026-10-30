const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/', reservationController.getAllReservations);
router.post('/', reservationController.createReservation);
router.post('/:id/check-in', reservationController.checkIn);
router.post('/:id/check-out', reservationController.checkOut);

module.exports = router;
