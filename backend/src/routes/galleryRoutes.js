const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/galleryController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.list);
router.post('/', authenticate, requireAdmin, ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/:id', authenticate, requireAdmin, ctrl.remove);

module.exports = router;
