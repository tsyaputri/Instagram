const multer = require('multer');
const path = require('path');
const User = require('../models/userModel');

// Konfigurasi upload file untuk update profile
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_pics/');
  },
  filename: (req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
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
}).single('profile_pic');

// Update user profile
const updateUser = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { username, email, bio, password } = req.body;
    const profile_pic = req.file ? `/uploads/profile_pics/${req.file.filename}` : undefined;

    try {
      const updatedData = { username, email, bio };
      if (profile_pic) updatedData.profile_pic = profile_pic;
      if (password) updatedData.password = password;

      const user = await User.update(req.user.id, updatedData);
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        profile_pic: user.profile_pic,
        bio: user.bio,
        role: user.role
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
};

module.exports = {
  updateUser
};