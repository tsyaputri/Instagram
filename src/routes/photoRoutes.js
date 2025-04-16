const express = require('express');
const router = express.Router();
const { uploadPhoto, getUserPhotos } = require('../controllers/photoController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/upload', protect, uploadPhoto);
router.get('/me', protect, getUserPhotos);

module.exports = router;