const multer = require('multer');
const path = require('path');
const User = require('../models/userModel');
const Photo = require('../models/photoModel');

// Konfigurasi upload file untuk admin
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_pics/');
  },
  filename: (req, file, cb) => {
    cb(null, `admin-${Date.now()}${path.extname(file.originalname)}`);
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

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive data
    delete user.password;

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { username, email, password, bio, role } = req.body;
    const profile_pic = req.file ? `/uploads/profile_pics/${req.file.filename}` : null;

    try {
      const user = await User.create({ username, email, password, bio, profile_pic, role });
      
      // Remove password from response
      delete user.password;

      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
};

// Update user (admin only)
const updateUser = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { username, email, bio, role, password } = req.body;
    const profile_pic = req.file ? `/uploads/profile_pics/${req.file.filename}` : undefined;

    try {
      const updatedData = { username, email, bio, role };
      if (profile_pic) updatedData.profile_pic = profile_pic;
      if (password) updatedData.password = password;

      const user = await User.update(req.params.id, updatedData);
      
      // Remove password from response
      delete user.password;

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};