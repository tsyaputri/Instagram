const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

module.exports = {
    // Get all users (for admin)
    getAllUsers: async (req, res) => {
        try {
            // Only admin can access all users
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden: Admin access required' });
            }

            const [users] = await db.execute(
                'SELECT id, username, email, role, profile_pic, bio, created_at FROM users'
            );
            res.json(users);
        } catch (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get user profile
    getUserProfile: async (req, res) => {
        try {
            const userId = req.params.id;
            const requestingUser = req.user;

            // Admin can access any profile, users can only access their own
            if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(userId)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const [user] = await db.execute(
                'SELECT id, username, email, role, profile_pic, bio, created_at FROM users WHERE id = ?',
                [userId]
            );

            if (user.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user[0]);
        } catch (err) {
            console.error('Error fetching user profile:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Update user profile
    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { username, email, bio } = req.body;
            const requestingUser = req.user;

            // Check permissions
            if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(userId)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check if email already exists (excluding current user)
            const [emailCheck] = await db.execute(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );

            if (emailCheck.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            await db.execute(
                'UPDATE users SET username = ?, email = ?, bio = ? WHERE id = ?',
                [username, email, bio, userId]
            );

            res.json({ message: 'User updated successfully' });
        } catch (err) {
            console.error('Error updating user:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Update password
    updatePassword: async (req, res) => {
        try {
            const userId = req.params.id;
            const { oldPassword, newPassword } = req.body;
            const requestingUser = req.user;

            // Only the account owner can change password
            if (requestingUser.id !== parseInt(userId)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            // Get current password hash
            const [user] = await db.execute(
                'SELECT password FROM users WHERE id = ?',
                [userId]
            );

            if (user.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify old password
            const isMatch = await bcrypt.compare(oldPassword, user[0].password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await db.execute(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            );

            res.json({ message: 'Password updated successfully' });
        } catch (err) {
            console.error('Error updating password:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const requestingUser = req.user;

            // Only admin or account owner can delete
            if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(userId)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            // Prevent admin from deleting themselves
            if (requestingUser.role === 'admin' && requestingUser.id === parseInt(userId)) {
                return res.status(400).json({ error: 'Admin cannot delete themselves' });
            }

            await db.execute('DELETE FROM users WHERE id = ?', [userId]);

            res.json({ message: 'User deleted successfully' });
        } catch (err) {
            console.error('Error deleting user:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Admin create user
    adminCreateUser: async (req, res) => {
        try {
            // Only admin can access this
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden: Admin access required' });
            }

            const { username, email, password, role } = req.body;

            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check if email already exists
            const [emailCheck] = await db.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (emailCheck.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const [result] = await db.execute(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, role || 'user']
            );

            res.status(201).json({
                message: 'User created successfully',
                userId: result.insertId
            });
        } catch (err) {
            console.error('Error creating user:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};