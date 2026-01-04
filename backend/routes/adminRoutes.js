const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');
const authorizeRole = require('../utils/authorizeRole');
const {
  addManager,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserById
} = require('../controllers/UserController');

router.get('/user/:userId', authMiddleware, authorizeRole('ADMIN'), getUserById);
router.post('/add-manager', authMiddleware, authorizeRole('ADMIN'), addManager);
router.get('/all-users', authMiddleware, authorizeRole('ADMIN'), getAllUsers);
router.put('/update-user/:userId', authMiddleware, authorizeRole('ADMIN'), updateUser);
router.delete('/delete-user/:userId', authMiddleware, authorizeRole('ADMIN'), deleteUser);

module.exports = router;
