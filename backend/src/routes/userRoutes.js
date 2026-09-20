const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, ctrl.listUsers);
router.get('/:id', authenticate, requireAdmin, ctrl.getUser);
router.put('/:id/role', authenticate, requireAdmin, ctrl.updateUserRole);

module.exports = router;
