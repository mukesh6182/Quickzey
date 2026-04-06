const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, 
    email: { type: String, required: true },
    phone: { type: String },  // Optional now
    
    addressLine: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    addressLabel: { type: String, enum: ['HOME','WORK','OTHER'], default: 'HOME' },
    
    products: [
      {
        storeProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        image: { type: String }
      }
    ],    
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['COD','CARD','UPI','WALLET'], default: 'COD' },

    status: {
      type: String,
      enum: ['PENDING','CONFIRMED','PREPARING','READY_FOR_PICKUP','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'],
      default: 'PENDING'
    },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deliveryOTP: { type: String },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
