// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

router.get('/users', adminAuth, adminController.getAllUsers);
router.get('/users/:id', adminAuth, adminController.getUser);
router.post(
  '/users', 
  adminAuth, 
  upload.single('profile_pic'), 
  adminController.createUser
);
router.put(
  '/users/:id', 
  adminAuth, 
  upload.single('profile_pic'), 
  adminController.updateUser
);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

module.exports = router;