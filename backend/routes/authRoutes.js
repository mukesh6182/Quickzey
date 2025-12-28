const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerManual, loginManual, registerGoogle, verifyEmailOtp } = require('../controllers/UserController');
const generateToken = require('../utils/generateToken');


router.post('/register', registerManual);
router.post('/register/verify-otp', verifyEmailOtp);
router.post('/login', loginManual);


router.post('/register/google', registerGoogle);


router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  async (req, res) => {
    try {
      const token = generateToken(req.user);
      res.redirect(`http://localhost:4200`);
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  }
);

module.exports = router;
