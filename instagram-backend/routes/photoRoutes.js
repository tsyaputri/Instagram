const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', auth, upload.single('photo'), photoController.uploadPhoto);
router.get('/:userId', photoController.getUserPhotos);

module.exports = router;