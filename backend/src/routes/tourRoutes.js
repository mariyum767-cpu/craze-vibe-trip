const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tourController');
const dateCtrl = require('../controllers/tourDateController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.listTours);
router.get('/admin/all', authenticate, requireAdmin, ctrl.listToursAdmin);
router.get('/:id', ctrl.getTour);
router.post('/', authenticate, requireAdmin, ctrl.createTour);
router.put('/:id', authenticate, requireAdmin, ctrl.updateTour);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteTour);

router.post('/:tour_id/itinerary', authenticate, requireAdmin, ctrl.upsertItineraryDay);
router.delete('/itinerary/:dayId', authenticate, requireAdmin, ctrl.deleteItineraryDay);

// Tour Dates (multiple departures per tour, each with its own coaster)
router.get('/:tour_id/dates', dateCtrl.listByTour);
router.post('/:tour_id/dates', authenticate, requireAdmin, dateCtrl.createTourDate);
router.put('/dates/:dateId', authenticate, requireAdmin, dateCtrl.updateTourDate);
router.delete('/dates/:dateId', authenticate, requireAdmin, dateCtrl.deleteTourDate);

module.exports = router;
