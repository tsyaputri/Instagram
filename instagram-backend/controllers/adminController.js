// controllers/adminController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

module.exports = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const [users] = await db.execute(`
        SELECT id, username, email, role, profile_pic, bio 
        FROM users
      `);
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get single user
  getUser: async (req, res) => {
    try {
      const [user] = await db.execute(`
        SELECT id, username, email, role, profile_pic, bio 
        FROM users 
        WHERE id = ?
      `, [req.params.id]);
      
      if (user.length === 0) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }
      
      res.json(user[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Create new user (by admin)
  createUser: async (req, res) => {
    try {
      const { username, email, password, role, bio } = req.body;
      
      // Validasi email unik
      const [existing] = await db.execute(
        'SELECT id FROM users WHERE email = ?', 
        [email]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email sudah terdaftar.' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Simpan ke database
      const [result] = await db.execute(
        `INSERT INTO users 
        (username, email, password, role, bio, profile_pic) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, role, bio, req.file?.path]
      );

      res.status(201).json({ 
        id: result.insertId,
        username,
        email,
        role,
        bio
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const { username, email, role, bio } = req.body;

      await db.execute(
        `UPDATE users 
        SET username = ?, email = ?, role = ?, bio = ?
        ${req.file ? ', profile_pic = ?' : ''}
        WHERE id = ?`,
        req.file 
          ? [username, email, role, bio, req.file.path, userId]
          : [username, email, role, bio, userId]
      );

      res.json({ message: 'User berhasil diperbarui.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ message: 'User berhasil dihapus.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};