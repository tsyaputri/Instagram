const db = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Get user profile (bisa diakses oleh pemilik akun atau admin)
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user; // Dari middleware auth

    // Admin bisa akses semua profile, user hanya bisa akses profil sendiri
    if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Jangan kembalikan password
    delete user.password;

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile (admin bisa update semua, user hanya update sendiri)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, profile_pic } = req.body;
    const requestingUser = req.user;

    // Validasi akses
    if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Update data
    await db.execute(
      'UPDATE users SET username = ?, email = ?, profile_pic = ? WHERE id = ?',
      [username, email, profile_pic, userId]
    );

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update password (hanya pemilik akun)
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    const requestingUser = req.user;

    // Hanya pemilik akun yang bisa ganti password
    if (requestingUser.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Verifikasi password lama
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user (admin bisa hapus semua, user hanya hapus akun sendiri)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user;

    // Validasi akses
    if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin-only: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [users] = await db.execute('SELECT id, username, email, role FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin-only: Create new user (tanpa perlu register)
exports.adminCreateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ username, email, password: hashedPassword, role });
    res.status(201).json({ message: 'User created by admin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};