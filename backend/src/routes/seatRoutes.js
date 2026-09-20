const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/seatController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/tour/:tourId', ctrl.listByTour);
router.post('/tour/:tourId/generate', authenticate, requireAdmin, ctrl.generateSeats);
router.get('/tour-date/:tourDateId', ctrl.listByTourDate);
router.post('/tour-date/:tourDateId/generate', authenticate, requireAdmin, ctrl.generateSeatsForDate);
router.put('/:id/block', authenticate, requireAdmin, ctrl.blockSeat);
router.put('/:id/unblock', authenticate, requireAdmin, ctrl.unblockSeat);

module.exports = router;
