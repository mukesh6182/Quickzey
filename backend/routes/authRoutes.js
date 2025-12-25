const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerManual, loginManual, registerGoogle, verifyEmailOtp } = require('../controllers/UserController');


router.post('/register', registerManual);
router.post('/register/verify-otp', verifyEmailOtp);

router.post('/login', loginManual);


router.post('/register/google', registerGoogle);


router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

module.exports = router;
