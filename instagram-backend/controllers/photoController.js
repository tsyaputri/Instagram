const Photo = require('../models/Photo');

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { caption } = req.body;
    const image_url = `/uploads/${req.file.filename}`;

    await Photo.create({
      user_id: req.user.id,
      image_url,
      caption
    });

    res.status(201).json({ message: 'Photo uploaded successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserPhotos = async (req, res) => {
  try {
    const photos = await Photo.findByUserId(req.params.userId);
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};