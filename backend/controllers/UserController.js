const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('../utils/Passport');
const sendMail =require("../utils/sendMail");
const generateToken = require('../utils/generateToken');
require('dotenv').config();
/* ======================
   Helpers
====================== */

// Generate JWT

// Generate 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ======================
   MANUAL REGISTER (OTP)
====================== */
const registerManual = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const otp = generateOtp();


    let user = await User.findOne({ email });
    if(!name || !email || !phone || !password ){
                return res.status(400).json({ message: "Required fields are missing" });        
            }
            const EmailExists= await User.findOne({email:email});
            const PhoneExists= await User.findOne({phone:phone});
            if(EmailExists ){
                return res.status(409).json({message:"Email is Already Exists !!"});
            }
            if(PhoneExists ){
                return res.status(409).json({message:"Phone number is Already Exists !!"});
            }
    
    // Existing active user → block
    if (user && user.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    // Existing pending user → resend OTP
    if (user && user.status === 'PENDING') {
      user.name = name;
      user.phone = phone;
      user.password = password; // model will hash it
      user.emailOtp = otp;
      user.emailOtpExpires = Date.now() + 10 * 60 * 1000;

      await user.save();

      // TODO: send OTP email

      return res.status(200).json({ message: 'OTP resent to email. Please verify.' });
    }
    

    // New user
    user = new User({
      name,
      email,
      phone,
      password, // model hashes
      provider: 'manual',
      status: 'PENDING',
      emailOtp: otp,
      emailOtpExpires: Date.now() + 10 * 60 * 1000,
    });

    await user.save();

    const sendMail = require('../utils/sendMail');
    const { generateOtpEmail } = require('../utils/generateOtpEmail');

    // After saving user:
    await sendMail(user.email, 'Verify your Quickzey Account', generateOtpEmail(user.name, otp));


    res.status(201).json({ message: 'OTP sent to email. Please verify.' });
  } catch (error) {
    console.error(error);
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

    if (!user) {
      return res.status(400).json({ message: 'Invalid request.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified.' });
    }

    if (
      String(user.emailOtp) !== String(otp) ||
      user.emailOtpExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.status = 'ACTIVE';
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;

    await user.save();

    res.status(200).json({
      message: 'Email verified successfully.',
      token: generateToken(user)
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

    if (user.status === 'PENDING') {
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    if (user.status === 'DISABLED') {
      return res.status(403).json({ message: 'Account disabled. Contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    res.json({ token: generateToken(user), message: 'Login successful.' });
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
      // Disabled check
      if (user.status === 'DISABLED') {
        return res.status(403).json({ message: 'Account disabled. Contact support.' });
      }

      // Existing Google user → login
      if (user.googleId) {
        return res.status(200).json({ message: 'Google login successful.', token: generateToken(user) });
      }

      // Existing manual user → link Google account
      user.googleId = googleId;
      user.isEmailVerified = true;
      user.status = 'ACTIVE';
      await user.save();

      return res.status(200).json({ message: 'Google account linked.', token: generateToken(user) });
    }

    // New Google user
    user = new User({
      name,
      email,
      googleId,
      provider: 'google',
      status: 'ACTIVE',
      isEmailVerified: true,
    });

    await user.save();

    res.status(201).json({ message: 'Google registration successful.', token: generateToken(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
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
};
