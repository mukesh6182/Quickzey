const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerManual, loginManual, registerGoogle, verifyEmailOtp, addManager } = require('../controllers/UserController');
const generateToken = require('../utils/generateToken');
const authMiddleware = require('../utils/authMiddleware');
const authorizeRole = require('../utils/authorizeRole');


router.post('/register', registerManual);
router.post('/register/verify-otp', verifyEmailOtp);
router.post('/login', loginManual);

router.post('/add-manager',authMiddleware,authorizeRole('ADMIN'),addManager);
router.post('/register/google', registerGoogle);


router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/', session: false }),
//   async (req, res) => {
//     try {
//       const token = generateToken(req.user);
//       const { name, role } = req.user;
//       // Pass token, name, and role to the frontend via query parameters
//       res.redirect(`http://localhost:4200/auth/google/callback?token=${token}&name=${name}&role=${role}`);
//     } catch (err) {
//       console.error(err);
//       res.redirect('/');
//     }
//   }
// );
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      session: false,
      failureRedirect:
        'http://localhost:4200/login?error=manual_account',
    })(req, res, next);
  },
  (req, res) => {
    const token = generateToken(req.user);
    const { name, role } = req.user;

    res.redirect(
      `http://localhost:4200/auth/google/callback?token=${token}&name=${name}&role=${role}`
    );
  }
);


module.exports = router;
