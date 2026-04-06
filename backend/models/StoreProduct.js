const mongoose = require('mongoose');

const storeProductSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },

    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0
    },

    status: {
      type: String,
      enum: ['AVAILABLE', 'UNAVAILABLE', 'DISABLED'],
      default: 'AVAILABLE',
      required: true
    }
  },
  { timestamps: true }
);

// Ensure each product can only appear once per store
storeProductSchema.index({ store: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('StoreProduct', storeProductSchema);
