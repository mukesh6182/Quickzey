const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      match: [/^[A-Za-z\s]+$/, 'Name must not contain numbers or special characters'],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Invalid email'],
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: v => !v || /^[0-9]{10}$/.test(v),
        message: 'Phone must be 10 digits',
      },
    },

    password: {
      type: String,
      minlength: 6,
      select: false,
      required: function () {
        return this.provider === 'manual';
      },
    },

    provider: {
      type: String,
      enum: ['manual', 'google'],
      default: 'manual',
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: ['CUSTOMER', 'DELIVERY', 'STORE_MANAGER', 'ADMIN'],
      default: 'CUSTOMER',
    },

    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'DISABLED'],
      default: 'PENDING',
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailOtp: {
      type: String,
      select: false,
    },

    emailOtpExpires: {
      type: Date,
      select: false,
    },
    isAssignedToStore: {
      type: Boolean,
      default: false,
      required: function () {
        return this.role === 'STORE_MANAGER';
      },
    },
    loginAttempts: {
      type: Number,
      default: 0
    },

    lockUntil: {
      type: Date,
      default: null
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Compare password
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
