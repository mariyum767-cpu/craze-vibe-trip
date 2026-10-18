const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/vehicleController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, ctrl.listVehicles);
router.post('/', authenticate, requireAdmin, ctrl.createVehicle);
router.put('/:id', authenticate, requireAdmin, ctrl.updateVehicle);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteVehicle);

module.exports = router;
