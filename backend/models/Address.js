const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'User is required'], 
      index: true 
    },

    label: { 
      type: String, 
      enum: ['HOME', 'WORK', 'OTHER'], 
      default: 'HOME' 
    },

    addressLine: { 
      type: String, 
      required: [true, 'Address is required'], 
      trim: true,
      minlength: [5, 'Address must be at least 5 characters']
    },

    landmark: { 
      type: String, 
      trim: true 
    },

    city: { 
      type: String, 
      required: [true, 'City is required'], 
      trim: true 
    },

    state: { 
      type: String, 
      required: [true, 'State is required'], 
      trim: true 
    },

    pincode: { 
      type: String, 
      required: [true, 'Pincode is required'], 
      match: [/^[0-9]{6}$/, 'Pincode must be 6 digits']
    },

    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
