const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/statsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, ctrl.dashboardStats);

module.exports = router;
