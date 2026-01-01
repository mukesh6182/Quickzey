const mongoose = require('mongoose');

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
      line1: {
        type: String,
        required: true,
      },
      line2: {
        type: String,
      },
      area: {
        type: String,
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
    },

    workingHours: {
    open: {
        type: String, // "08:00"
        default: '08:00',
    },
    close: {
        type: String, // "23:00"
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
