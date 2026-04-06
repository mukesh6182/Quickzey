const Order = require('../models/Order');
const User = require('../models/User');
const sendMail = require("../utils/sendMail");
const { generateOrderConfirmationEmail } = require("../utils/generateOtpEmail");
const placeOrder = async (req, res) => {
  try {
    const { products, totalAmount, address } = req.body;

    const userData = await User.findById(req.user.id);

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const newOrder = new Order({
      user: userData._id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '', 
      
      addressLine: address.addressLine,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      addressLabel: address.label,
      
      products: products,
      totalAmount: totalAmount,
      paymentMethod: 'COD',
      status: 'PENDING'
    });

    await newOrder.save();


    await sendMail(
      userData.email,
      "Your Quickzey Order Confirmation",
      generateOrderConfirmationEmail(
        userData.name,
        newOrder._id,
        products,
        totalAmount,
        address
      )
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      orderId: newOrder._id
    });

  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ 
      message: error.message || "Internal Server Error" 
    });
  }
};
const getMyOrders = async (req, res) => {
  try {    
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};
const getPartnerDeliveries = async (req, res) => {
  try {
    // 1. Identify the delivery partner from the auth middleware
    const partnerId = req.user.id;

    // 2. Fetch orders where this partner is assigned 
    // and status is either 'OUT_FOR_DELIVERY' or 'DELIVERED'
    const deliveries = await Order.find({
      deliveryPartner: partnerId,
      status: { $in: ['OUT_FOR_DELIVERY', 'DELIVERED'] }
    }).sort({ updatedAt: -1 }); // Show most recent updates first

    // 3. Optional: Count stats for the partner dashboard
    const activeCount = deliveries.filter(o => o.status === 'OUT_FOR_DELIVERY').length;
    const completedCount = deliveries.filter(o => o.status === 'DELIVERED').length;

    res.status(200).json({
      success: true,
      results: deliveries.length,
      stats: {
        active: activeCount,
        completed: completedCount
      },
      deliveries
    });
  } catch (error) {
    console.error("Error fetching partner deliveries:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching delivery history", 
      error: error.message 
    });
  }
};
const verifyDeliveryOTP = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const partnerId = req.user.id; // From authMiddleware

    // 1. Find the order and ensure it belongs to this partner
    const order = await Order.findOne({ 
      _id: orderId, 
      deliveryPartner: partnerId,
      status: 'OUT_FOR_DELIVERY' 
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or already processed." });
    }

    // 2. Validate OTP
    if (order.deliveryOTP !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please check with the customer." });
    }

    // 3. Update Order Status
    order.status = 'DELIVERED';
    order.deliveryOTP = undefined; // Clear OTP once used
    await order.save();

    // 4. Reset Partner Status to AVAILABLE
    await User.findByIdAndUpdate(partnerId, { deliveryStatus: 'AVAILABLE' });

    res.status(200).json({
      success: true,
      message: "Order delivered successfully! You are now available for new tasks."
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { placeOrder, getMyOrders ,getPartnerDeliveries,verifyDeliveryOTP };

