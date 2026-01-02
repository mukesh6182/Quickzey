const mongoose = require('mongoose');
const User = require('../models/User');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    storeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    servedPincodes: {
      type: [String], // e.g. ["380071", "380072"]
      required: true,
      index: true,
    },

    address: {
      line1: { type: String, required: true },  // mandatory      
      area: { type: String, required: true },  // mandatory
      city: { type: String, required: true },  // mandatory
      pincode: { type: String, required: true }, // mandatory
      state: { type: String, required: true }, // mandatory
    },

    workingHours: {
      open: {
        type: String,
        default: '08:00',
      },
      close: {
        type: String,
        default: '23:00',
      },
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
      default: 'ACTIVE',
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
