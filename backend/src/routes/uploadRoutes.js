const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/uploadController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Admin-only: upload an image file, get back a public URL to store
// (e.g. as a tour's cover_image, a destination's image_url, a gallery entry).
router.post('/', authenticate, requireAdmin, ctrl.uploadMiddleware, ctrl.uploadImage);

module.exports = router;
