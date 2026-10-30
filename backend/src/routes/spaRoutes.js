const express = require('express');
const router = express.Router();
const spaController = require('../controllers/spaController');

router.get('/services', spaController.getAllSpaServices);
router.get('/therapists', spaController.getTherapists);
router.get('/appointments', spaController.getAllAppointments);
router.post('/appointments', spaController.bookSpaAppointment);
router.patch('/appointments/:id/status', spaController.updateAppointmentStatus);

module.exports = router;
