const User = require('../models/User');
const Store = require('../models/Store');

// Get last added storeCode
const getLastStoreCode = async (req, res) => {
  try {
    const lastStore = await Store.findOne().sort({ createdAt: -1 });
    if (!lastStore) {
      return res.json({
        message: 'No stores found yet',
        lastStoreCode: null,
      });
    }

    res.json({
      message: 'Last added storeCode fetched successfully',
      lastStoreCode: lastStore.storeCode,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new store
const addStore = async (req, res) => {
  try {
    const {
      name,
      storeCode,
      servedPincodes,
      line1,
      area,
      city,
      pincode,
      state,
      status,
      manager,
    } = req.body;

    // Validate required fields
    if (!name || !storeCode || !servedPincodes || !line1 || !area || !city || !pincode || !state || !manager) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!Array.isArray(servedPincodes) || servedPincodes.length === 0) {
      return res.status(400).json({ message: 'servedPincodes must be a non-empty array' });
    }

    const existingStore = await Store.findOne({ storeCode });
    if (existingStore) {
      return res.status(409).json({ message: 'Store with this storeCode already exists' });
    }

    const address = { line1, area, city, pincode, state };

    const store = await Store.create({
      name,
      storeCode,
      servedPincodes,
      address,
      status,
      manager,
    });
    await User.findByIdAndUpdate(manager, {
      isAssignedToStore: true,
    });

    return res.status(201).json({
      message: 'Store created successfully',
      data: store,
    });
  } catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all stores (optionally by status)
const getAllStores = async (req, res) => {
  try {
    const { status } = req.query; // e.g., ?status=ACTIVE
    const query = status ? { status } : {};
    const stores = await Store.find(query)
      .populate('manager', 'name');

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get store by ID
const getStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id).populate('manager', 'name');

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.status(200).json({ success: true, data: store });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update store by ID
// Update store by ID
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Handle address updates separately
    if (updates.address) {
      const addressFields = ['line1', 'area', 'city', 'pincode', 'state'];
      addressFields.forEach(field => {
        if (updates.address[field] !== undefined) store.address[field] = updates.address[field];
      });
    }

    // Update other fields
    ['name', 'storeCode', 'servedPincodes', 'status', 'manager'].forEach(field => {
      if (updates[field] !== undefined) store[field] = updates[field];
    });

    await store.save();

    res.status(200).json({ success: true, message: 'Store updated successfully', data: store });
  } catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Soft delete store (mark INACTIVE)
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    store.status = 'INACTIVE';
    await store.save();

    res.status(200).json({ success: true, message: 'Store marked as INACTIVE' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Set store status to MAINTENANCE
const setMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    store.status = 'MAINTENANCE';
    await store.save();

    res.status(200).json({ success: true, message: 'Store marked as MAINTENANCE', data: store });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all stores grouped by status
const getStoresByStatus = async (req, res) => {
  try {
    const stores = await Store.find().populate('manager', 'name');

    const groupedStores = {
      ACTIVE: [],
      INACTIVE: [],
      MAINTENANCE: [],
    };

    stores.forEach((store) => {
      if (groupedStores[store.status]) {
        groupedStores[store.status].push(store);
      } else {
        groupedStores[store.status] = [store];
      }
    });

    res.status(200).json({
      success: true,
      count: stores.length,
      data: groupedStores,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  addStore,
  getLastStoreCode,
  getAllStores,
  getStore,
  updateStore,
  deleteStore,
  setMaintenance,
  getStoresByStatus,
};
