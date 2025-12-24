const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Manual Registration
exports.registerManual = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Create new user
    user = new User({
      name,
      email,
      phone,
      password,
      role,
      provider: 'manual',
    });

    // Save user
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Manual Login
exports.loginManual = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Google Registration (after Google OAuth)
exports.registerGoogle = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ googleId });
    if (user) {
      return res.status(200).json({ message: 'Google login successful', token: generateToken(user) });
    }

    // Create new user
    user = new User({
      name,
      email,
      googleId,
      provider: 'google',
    });

    await user.save();
    res.status(201).json({ message: 'Google registration successful', token: generateToken(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate JWT Token (for both manual and google login)
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};
