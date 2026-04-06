const Address = require('../models/Address'); // Import your Address model
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const sendMail = require("../utils/sendMail");
const generateToken = require('../utils/generateToken');
const { generateForgotPasswordEmail } = require('../utils/generateOtpEmail');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -emailOtp -emailOtpExpires -__v');
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

    
    const { password, emailOtp, emailOtpExpires, ...userData } = user.toObject();

    res.status(200).json({ message: 'User updated successfully.', user: userData });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Server error updating user.' });
  }
};

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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 1️⃣ Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // 2️⃣ Get user (explicitly select password)
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3️⃣ Block Google users
    if (user.provider !== 'manual') {
      return res.status(400).json({
        message: 'Password change not allowed for social login users',
      });
    }

    // 4️⃣ Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // 5️⃣ Prevent reusing old password
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password must be different from old password',
      });
    }

    // 6️⃣ Update password
    user.password = newPassword;
    await user.save(); // pre-save hook hashes password

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user || user.provider !== 'manual') {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account not active' });
    }

    const otp = generateOtp();

    user.emailOtp = otp;
    user.emailOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    

    await sendMail(
      user.email,
      'Quickzey Password Reset OTP',
      generateForgotPasswordEmail(user.name, otp)
    );

    res.status(200).json({
      message: 'OTP sent to email',
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (
      String(user.emailOtp) !== String(otp) ||
      user.emailOtpExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // ✅ OTP verified — DO NOT reset password yet
    res.status(200).json({
      message: 'OTP verified successfully',
      allowPasswordReset: true,
      email
    });

  } catch (error) {
    console.error('Verify Forgot OTP Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    const isNewPasswordSameAsOld = await user.matchPassword(newPassword);

    if (isNewPasswordSameAsOld) {
      return res.status(400).json({ message: 'New password cannot be the same as the old password. Please choose a different one.' });
    }

    user.password = newPassword;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;

    await user.save();

    res.status(200).json({
      message: 'Password reset successful. Please login.',
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get Logged-in User Profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // req.user.id comes from protect middleware
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Logged-in User Profile
const updateMyProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    
    if (phone && phone !== user.phone) {
      const exists = await User.findOne({ phone });
      if (exists) return res.status(409).json({ message: 'Phone already in use' });
      user.phone = phone;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addDeliveryPartner = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // 1️⃣ Validate required fields
    if (!name || !email || !phone || !password || !address) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // 2️⃣ Validate email and phone uniqueness
    const emailExists = await User.findOne({ email });
    const phoneExists = await User.findOne({ phone });

    if (emailExists) {
      return res.status(409).json({ message: "Email already exists!" });
    }
    if (phoneExists) {
      return res.status(409).json({ message: "Phone number already exists!" });
    }

    // 3️⃣ Create new delivery partner user
    const user = new User({
      name,
      email,
      phone,
      password,
      role: "DELIVERY",
      provider: 'manual',
      status: "ACTIVE",
      isEmailVerified: true,
    });

    await user.save();

    // 4️⃣ Create the address
    const newAddress = new Address({
      user: user._id,
      label: address.label || 'HOME',
      addressLine: address.addressLine,
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault || true,
      isActive: true,
    });

    await newAddress.save();

    res.status(201).json({
      message: "Delivery Partner added successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      address: newAddress,
    });

  } catch (error) {
    console.error("Add Delivery Partner Error:", error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    res.status(500).json({ message: 'Server error' });
  }
};
const toggleDeliveryStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'DELIVERY') {
      return res.status(404).json({ message: 'Delivery partner not found.' });
    }
    
    if (user.deliveryStatus === 'ASSIGNED') {
      return res.status(400).json({ 
        message: 'Cannot change status while you have an active delivery task.' 
      });
    }

    user.deliveryStatus = user.deliveryStatus === 'AVAILABLE' ? 'OFF_DUTY' : 'AVAILABLE';
    
    await user.save();
    

    res.status(200).json({ 
      success: true, 
      message: `Status updated to ${user.deliveryStatus}`, 
      deliveryStatus: user.deliveryStatus 
    });
  } catch (error) {
    console.error('Toggle Status Error:', error);
    res.status(500).json({ message: 'Server error while toggling status.' });
  }
};

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
  getUserById,
  changePassword,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  getMyProfile,
  updateMyProfile,
  addDeliveryPartner,
  toggleDeliveryStatus
};
