const multer = require('multer');
const path = require('path');
const Photo = require('../models/photoModel');

// Konfigurasi upload foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/photos/');
  },
  filename: (req, file, cb) => {
    cb(null, `photo-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
}).single('photo');

// Upload photo
const uploadPhoto = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a photo' });
    }

    try {
      const image_url = `/uploads/photos/${req.file.filename}`;
      const photo = await Photo.create({
        user_id: req.user.id,
        image_url,
        caption
      });

      res.status(201).json(photo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
};

// Get user photos
const getUserPhotos = async (req, res) => {
  try {
    const photos = await Photo.findByUserId(req.user.id);
    res.json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  uploadPhoto,
  getUserPhotos
};