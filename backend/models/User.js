const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
    match: [/^[A-Za-z\s]+$/, 'Name must not contain numbers or special characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  phone: {
    type: String,
    required: function () { return this.provider === 'manual'; }, // Make it required only for manual registration
    validate: {
    validator: function (v) {
      return /^[0-9]{10}$/.test(v);  // Validate that the phone is a 10-digit number
        },
    message: 'Phone number must be 10 digits',
    },
  },

  password: {
    type: String,
    required: function () { return this.provider === 'manual'; }, 
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: {
    type: String,
    enum: ['CUSTOMER', 'DELIVERY', 'STORE_MANAGER', 'ADMIN'],
    default: 'CUSTOMER',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  provider: {
    type: String,
    enum: ['manual', 'google'],
    default: 'manual',
  },
  googleId: {
    type: String,
    required: function () { return this.provider === 'google'; },
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
