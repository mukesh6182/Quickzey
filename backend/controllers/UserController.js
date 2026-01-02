const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const sendMail = require("../utils/sendMail");
const generateToken = require('../utils/generateToken');



// Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ======================
   MANUAL REGISTER (OTP)
====================== */
const registerManual = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const otp = generateOtp();

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be 10 digits' });
    }

    const EmailExists = await User.findOne({ email });
    const PhoneExists = await User.findOne({ phone });
    
    if (EmailExists) {
      if (EmailExists.status === 'PENDING') {
        // update OTP & resend
        EmailExists.emailOtp = otp;
        EmailExists.emailOtpExpires = Date.now() + 10 * 60 * 1000;

        await EmailExists.save();

        const { generateOtpEmail } = require('../utils/generateOtpEmail');
        await sendMail(
          EmailExists.email,
          'Verify your Quickzey Account',
          generateOtpEmail(EmailExists.name, otp)
        );

        return res.status(200).json({
          message: 'OTP sent again. Please verify your email.'
        });
      }

      // email exists but not pending
      return res.status(409).json({ message: "Email already exists!" });
    }

    if (PhoneExists) {
      return res.status(409).json({ message: "Phone number already exists!" });
    }

    // ✅ Normal new registration (unchanged)
    const user = new User({
      name,
      email,
      phone,
      password,
      provider: 'manual',
      status: 'PENDING',
      emailOtp: otp,
      emailOtpExpires: Date.now() + 10 * 60 * 1000,
      role: 'CUSTOMER'
    });

    await user.save();

    const { generateOtpEmail } = require('../utils/generateOtpEmail');
    await sendMail(
      user.email,
      'Verify your Quickzey Account',
      generateOtpEmail(user.name, otp)
    );

    res.status(201).json({ message: 'OTP sent to email. Please verify.' });

  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    res.status(500).json({ message: 'Server error' });
  }
};


/* ======================
   VERIFY EMAIL OTP
====================== */
const verifyEmailOtp = async (req, res) => {
  try {    
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpires');

    if (!user) return res.status(400).json({ message: 'Invalid request.' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified.' });
    if (String(user.emailOtp) !== String(otp) || user.emailOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.status = 'ACTIVE';
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;

    await user.save();

    res.status(200).json({
      message: 'Email verified successfully.',
      token: generateToken(user),
      name: user.name,
      role: user.role || 'CUSTOMER'
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ======================
   MANUAL LOGIN
====================== */
const loginManual = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || user.provider !== 'manual') {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    if (user.status === 'PENDING') return res.status(403).json({ message: 'Please verify your email first.' });
    if (user.status === 'DISABLED') return res.status(403).json({ message: 'Account disabled. Contact support.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    res.json({ 
      token: generateToken(user), 
      name: user.name,
      role: user.role || 'CUSTOMER',
      message: 'Login successful.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/* ======================
   GOOGLE REGISTER / LOGIN
====================== */
const registerGoogle = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (user.status === 'DISABLED') return res.status(403).json({ message: 'Account disabled. Contact support.' });

      // Existing Google user → login
      if (user.googleId) {
        return res.status(200).json({
          message: 'Google login successful.',
          token: generateToken(user),
          name: user.name,
          role: user.role || 'CUSTOMER'
        });
      }

      // Existing manual user → link Google account
      user.googleId = googleId;
      user.isEmailVerified = true;
      user.status = 'ACTIVE';
      await user.save();

      return res.status(200).json({
        message: 'Google account linked.',
        token: generateToken(user),
        name: user.name,
        role: user.role || 'CUSTOMER'
      });
    }

    // New Google user
    user = new User({
      name,
      email,
      googleId,
      provider: 'google',
      status: 'ACTIVE',
      isEmailVerified: true,
      role: 'CUSTOMER'
    });

    await user.save();

    res.status(201).json({
      message: 'Google registration successful.',
      token: generateToken(user),
      name: user.name,
      role: user.role || 'CUSTOMER'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getAvailableManagers = async (req, res) => {
  try {
    const managers = await User.find({
      role: 'STORE_MANAGER',
      status: 'ACTIVE',
      isAssignedToStore: false,
    }).select('_id name');

    res.status(200).json({
      success: true,
      count: managers.length,
      data: managers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available managers',
    });
  }
};

/* ======================
   Export all functions
====================== */
module.exports = {
  registerManual,
  verifyEmailOtp,
  loginManual,
  registerGoogle,
  getAvailableManagers,
};
