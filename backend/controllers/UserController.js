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

    const user = await User.findOne({ email }).select(
      '+password +loginAttempts +lockUntil'
    );

    // ❌ Invalid email or provider
    if (!user || user.provider !== 'manual') {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // ❌ Account status checks
    if (user.status === 'PENDING')
      return res.status(403).json({ message: 'Please verify your email first.' });

    if (user.status === 'DISABLED')
      return res.status(403).json({ message: 'Account disabled. Contact support.' });

    // 🔒 Check lock
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil - Date.now()) / (60 * 1000)
      );

      return res.status(429).json({
        message: `Too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await user.matchPassword(password);

    // ❌ Wrong password
    if (!isMatch) {
      user.loginAttempts += 1;

      // Lock after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
        user.loginAttempts = 0; // reset after lock
      }

      await user.save();
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // ✅ Successful login → reset counters
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.json({
      token: generateToken(user),
      name: user.name,
      role: user.role || 'CUSTOMER',
      message: 'Login successful.',
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


    let user = await User.findOne({ email });
    if (user) {
      // Disabled account
      if (user.status === 'DISABLED') {
        return res.status(403).json({
          message: 'Account disabled. Contact support.'
        });
      }
      
      // Manual account → block Google login
      if (!user.googleId) {
        return res.status(403).json({
          message: 'This account is not linked with Google. Please login using email and password.'
        });
      }

      // Existing Google user → login
      return res.status(200).json({
        message: 'Google login successful.',
        token: generateToken(user),
        name: user.name,
        role: user.role || 'CUSTOMER'
      });
    }

    // 2️⃣ New Google user → register
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

    return res.status(201).json({
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
const addManager=async(req,res)=>{
  try{
     const {name,email,phone,password}=req.body;  
     if(!name || !email || !phone || !password){      
        return res.status(400).json({ message: "Required fields are missing" });
     }
     const EmailExists = await User.findOne({email});
     const PhoneExists = await User.findOne({phone});
     if(EmailExists){
        return res.status(409).json({ message: "Email already exists!" });
     }
     if(PhoneExists){
        return res.status(409).json({ message: "Phone number already exists!"});
     }
     const user = new User({
        name,
        email,
        phone,
        password,
        role:"STORE_MANAGER",
        status:"ACTIVE",
        isEmailVerified:true,
        isAssignedToStore:false
     });
     await user.save();
     res.status(201).json({message:"Manager Addedd Successfully..."});
  }catch(error){
    console.log(error);    

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    res.status(500).json({ message: 'Server error' });
  
  }
}

/* ======================
   1️⃣ GET ALL USERS ROLE-WISE
====================== */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -emailOtp -emailOtpExpires -__v');

    // No grouping
    res.status(200).json({
      success: true,
      count: users.length,
      data: users, // flat array
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

/* ======================
   2️⃣ UPDATE MANAGER
====================== */
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Validate email uniqueness
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: 'Email already exists.' });
      user.email = email;
    }

    // Validate phone uniqueness
    if (phone && phone !== user.phone) {
      const exists = await User.findOne({ phone });
      if (exists) return res.status(409).json({ message: 'Phone already exists.' });
      user.phone = phone;
    }

    if (name) user.name = name;

    await user.save();

    // Remove sensitive fields before sending response
    const { password, emailOtp, emailOtpExpires, ...userData } = user.toObject();

    res.status(200).json({ message: 'User updated successfully.', user: userData });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Server error updating user.' });
  }
};

/* ======================
   3️⃣ DELETE MANAGER (SOFT DELETE)
====================== */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Soft delete: disable the user
    user.status = 'DISABLED';
    await user.save();

    res.status(200).json({ message: 'User account disabled successfully.' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
};
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -emailOtp -emailOtpExpires -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Server error fetching user.' });
  }
};


/* ======================
   Export all functions
====================== */
module.exports = {
  registerManual,
  verifyEmailOtp,
  addManager,
  loginManual,
  registerGoogle,
  getAvailableManagers,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserById
};
