const Address = require('../models/Address');
const User = require('../models/User');
const Order = require('../models/Order');
const Store = require('../models/Store');
const StoreProduct = require('../models/StoreProduct');
const { generateDeliveryAssignmentEmail } = require('../utils/generateOtpEmail');
const sendMail = require('../utils/sendMail'); 
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
      // { upsert: true } 

    // await Store.replaceOne({ _id: id }, req.body);

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

const getOrdersByStore = async (req, res) => {
  try {
    // 1. Identify the store managed by this user
    // Assuming req.user.id comes from your auth middleware
    const managedStore = await Store.findOne({ manager: req.user.id });

    if (!managedStore) {
      return res.status(404).json({ 
        success: false, 
        message: 'No store associated with this manager.' 
      });
    }

    // 2. Find all StoreProducts belonging to this store
    // We need these IDs to filter the Orders
    const storeProducts = await StoreProduct.find({ store: managedStore._id }).select('_id');
    const storeProductIds = storeProducts.map(sp => sp._id);

    // 3. Fetch orders that contain at least one product from this store
    // Sorted by 'createdAt' descending (latest first)
    const orders = await Order.find({
      'products.storeProductId': { $in: storeProductIds }
    })
    .sort({ createdAt: -1 })
    .populate('user', 'name email phone');

    // 4. Group orders by status for the frontend tabs
    const groupedOrders = {
      PENDING: [],
      CONFIRMED: [],
      PREPARING: [],
      READY_FOR_PICKUP: [],
      OUT_FOR_DELIVERY: [],
      DELIVERED: [],
      CANCELLED: []
    };

    orders.forEach(order => {
      if (groupedOrders[order.status]) {
        groupedOrders[order.status].push(order);
      }
    });

    res.status(200).json({
      success: true,
      storeName: managedStore.name,
      count: orders.length,
      data: groupedOrders
    });

  } catch (error) {
    console.error('Error fetching manager orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // 1. Validate the status is one of the allowed ones
    const allowedStatuses = ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    // 2. Security Check: Ensure this manager owns the store that has this order
    const managedStore = await Store.findOne({ manager: req.user.id });
    if (!managedStore) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage stores' });
    }

    // 3. Update the order
    // We check for the ID and ensure the order contains products from this store's inventory
    const storeProducts = await StoreProduct.find({ store: managedStore._id }).select('_id');
    const storeProductIds = storeProducts.map(sp => sp._id);
    // Order.replaceOne({ _id: orderId }, req.body);
    const order = await Order.findOneAndUpdate(
      { 
        _id: orderId, 
        'products.storeProductId': { $in: storeProductIds } 
      },
      { status: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or does not belong to your store.' 
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTopNearbyDeliveryPartners = async (req, res) => {
  try {
    const managedStore = await Store.findOne({ manager: req.user.id });
    if (!managedStore) {
      return res.status(404).json({ success: false, message: 'Store not found for this manager' });
    }

    const storePincode = Number(managedStore.address.pincode); // ensure numeric

    const nearbyPartners = await User.aggregate([
      {
        $match: {
          role: 'DELIVERY',
          deliveryStatus: 'AVAILABLE',
          status: 'ACTIVE'
        }
      },
      {
        $lookup: {
          from: 'addresses',
          localField: '_id',
          foreignField: 'user',
          as: 'addressInfo'
        }
      },
      {
        // unwind addresses to calculate distance
        $unwind: '$addressInfo'
      },
      {
        $addFields: {
          pincodeDiff: { $abs: { $subtract: [storePincode, { $toInt: '$addressInfo.pincode' }] } }
        }
      },
      {
        // only partners within 20 pincode difference
        $match: { pincodeDiff: { $lte: 20 } }
      },
      {
        $sort: { pincodeDiff: 1 } // closest first
      },
      {
        $project: {
          _id: 1,
          name: 1,
          phone: 1,
          deliveryStatus: 1,
          pincode: '$addressInfo.pincode',
          distance: '$pincodeDiff'
        }
      },
      { $limit: 10 } // return top 10 nearest
    ]);

    res.status(200).json({
      success: true,
      storeName: managedStore.name,
      storePincode,
      count: nearbyPartners.length,
      data: nearbyPartners
    });

  } catch (error) {
    console.error('Error in getTopNearbyDeliveryPartners:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const assignDeliveryPartner = async (req, res) => {
  try {
    const { orderId, partnerId } = req.body;

    if (!orderId || !partnerId) {
      return res.status(400).json({ success: false, message: 'Missing Order ID or Partner ID' });
    }

    // 1. Manager Ownership Check
    const managedStore = await Store.findOne({ manager: req.user.id });
    if (!managedStore) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // 2. Partner Validation
    const partner = await User.findOne({ _id: partnerId, role: 'DELIVERY' });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    // 3. Generate OTP & Update Order
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        deliveryPartner: partnerId,
        deliveryOTP: otp,
        status: 'OUT_FOR_DELIVERY' 
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 4. Update Partner Status
    await User.findByIdAndUpdate(partnerId, { deliveryStatus: 'ASSIGNED' });

    // 5. TRIGGER EMAIL (Matching your exact utility signature)
    if (order.email) {
      const emailHtml = generateDeliveryAssignmentEmail(
        order.name, 
        otp, 
        partner.name, 
        partner.phone, 
        order._id.toString()
      );

      const subject = `🚚 Your Quickzey Order #${order._id.toString().slice(-6).toUpperCase()} is on the way!`;
      
      sendMail(order.email, subject, emailHtml)
        .then(() => console.log(`Email successfully dispatched to: ${order.email}`))
        .catch(err => console.error('Background Email Error:', err.message));
    }

    res.status(200).json({
      success: true,
      message: 'Partner assigned and customer notified.',
      otp: otp,
      data: order
    });

  } catch (error) {
    console.error('Critical Controller Error:', error);
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
  getOrdersByStore,
  updateOrderStatus,
  getTopNearbyDeliveryPartners,
  assignDeliveryPartner
};
