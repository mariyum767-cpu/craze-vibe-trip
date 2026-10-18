const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', authenticate, ctrl.createBooking);
router.post('/admin/create', authenticate, requireAdmin, ctrl.adminCreateBooking);
router.get('/mine', authenticate, ctrl.myBookings);
router.get('/admin/all', authenticate, requireAdmin, ctrl.listAllBookings);
router.get('/:id', authenticate, ctrl.getBooking);
router.put('/:id/status', authenticate, requireAdmin, ctrl.updateBookingStatus);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteBooking);

module.exports = router;
