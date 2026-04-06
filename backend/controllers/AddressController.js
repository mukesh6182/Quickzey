const Address = require('../models/Address');
const User = require('../models/User');

// Add a new address
const addAddress = async (req, res) => {
  try {
    const { addressLine, landmark, city, state, pincode, label, isDefault } = req.body;

    // ✅ Validate required fields
    if (!addressLine || !city || !state || !pincode) {
      return res.status(400).json({ message: 'Address, city, state, and pincode are required.' });
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Pincode must be 6 digits.' });
    }

    // Optional: Set default if first address
    const existingAddresses = await Address.find({ user: req.user.id, isActive: true });
    const defaultFlag = existingAddresses.length === 0 ? true : !!isDefault;

    const address = new Address({
      user: req.user.id,
      addressLine,
      landmark,
      city,
      state,
      pincode,
      label: label || 'HOME',
      isDefault: defaultFlag
    });

    // If this address is set as default, reset others
    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: address._id } },
        { isDefault: false }
      );
    }

    await address.save();

    res.status(201).json({ message: 'Address added successfully.', address });

  } catch (error) {
    console.error('Add Address Error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { addressLine, landmark, city, state, pincode, label, isDefault } = req.body;

    const address = await Address.findById(addressId);

    if (!address || address.user.toString() !== req.user.id || !address.isActive) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    if (addressLine) address.addressLine = addressLine;
    if (landmark !== undefined) address.landmark = landmark;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) {
      if (!/^[0-9]{6}$/.test(pincode)) {
        return res.status(400).json({ message: 'Pincode must be 6 digits.' });
      }
      address.pincode = pincode;
    }
    if (label) address.label = label;
    if (isDefault !== undefined) address.isDefault = isDefault;

    // If updating default → unset other addresses
    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: address._id } },
        { isDefault: false }
      );
    }

    await address.save();
    // await Address.replaceOne({ _id: id }, req.body);

    res.status(200).json({ message: 'Address updated successfully.', address });

  } catch (error) {
    console.error('Update Address Error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// Remove (soft delete) an address
const removeAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await Address.findById(addressId);

    if (!address || address.user.toString() !== req.user.id || !address.isActive) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    address.isActive = false;

    // If default, optionally set another default
    if (address.isDefault) {
      const anotherAddress = await Address.findOne({ user: req.user.id, isActive: true });
      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }

    await address.save();

    res.status(200).json({ message: 'Address removed successfully.' });

  } catch (error) {
    console.error('Remove Address Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all addresses of a user
const getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id, isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: addresses.length, addresses });
  } catch (error) {
    console.error('Get All Addresses Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single address by ID
const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await Address.findById(addressId);

    if (!address || address.user.toString() !== req.user.id || !address.isActive) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    res.status(200).json({ success: true, address });

  } catch (error) {
    console.error('Get Address By ID Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addAddress,
  updateAddress,
  removeAddress,
  getAllAddresses,
  getAddressById
};
