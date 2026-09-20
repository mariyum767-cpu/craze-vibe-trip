const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviewController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.listApprovedReviews);
router.post('/', authenticate, ctrl.submitReview);
router.get('/mine', authenticate, ctrl.myReviews);
router.get('/admin/all', authenticate, requireAdmin, ctrl.listAllReviews);
router.put('/:id/status', authenticate, requireAdmin, ctrl.updateReviewStatus);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteReview);

module.exports = router;
