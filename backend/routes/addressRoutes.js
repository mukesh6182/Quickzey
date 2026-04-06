const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');
const {
  addAddress,
  updateAddress,
  removeAddress,
  getAllAddresses,
  getAddressById
} = require('../controllers/AddressController');

// All routes require authentication
router.use(authMiddleware);

// Add new address
router.post('/', addAddress);

// Update address
router.put('/:addressId', updateAddress);

// Remove address
router.delete('/:addressId', removeAddress);

// Get all addresses
router.get('/', getAllAddresses);

// Get single address
router.get('/:addressId', getAddressById);

module.exports = router;
