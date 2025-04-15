const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUserProfile);
router.put('/:id', auth, userController.updateUser);
router.put('/:id/password', auth, userController.updatePassword);
router.delete('/:id', auth, userController.deleteUser);
router.post('/admin/create', auth, userController.adminCreateUser);

module.exports = router;