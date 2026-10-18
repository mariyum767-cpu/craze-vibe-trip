const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/siteContentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.get('/:key', ctrl.getByKey);
router.put('/:key', authenticate, requireAdmin, ctrl.update);

module.exports = router;
