const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const User = require('../models/userModel');

// Konfigurasi upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_pics/');
  },
  filename: (req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.paramName)}`);
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

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        profile_pic: user.profile_pic,
        bio: user.bio,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Register user
const registerUser = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { username, email, password, bio } = req.body;
    const profile_pic = req.file ? `/uploads/profile_pics/${req.file.filename}` : null;

    try {
      // Check if user exists
      const userExists = await User.findByEmail(email);
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create user
      const user = await User.create({ username, email, password, bio, profile_pic });

      if (user) {
        res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          profile_pic: user.profile_pic,
          bio: user.bio,
          role: user.role,
          token: generateToken(user.id)
        });
      } else {
        res.status(400).json({ error: 'Invalid user data' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
};

module.exports = {
  loginUser,
  registerUser,
  getMe
};