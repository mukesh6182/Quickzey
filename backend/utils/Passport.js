const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // 🔍 Check by email FIRST
        let user = await User.findOne({ email });

        // ❌ Manual account exists → block Google login
        if (user && user.provider === 'manual') {
          return done(null, false, {
            message:
              'This email is registered manually. Please login using email and password.',
          });
        }

        // ✅ Google user exists → login
        if (user) {
          return done(null, user);
        }

        // ✅ New Google user → create
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          provider: 'google',
          status: 'ACTIVE',
          isEmailVerified: true,
          role: 'CUSTOMER',
        });

        return done(null, user);
      } catch (err) {
        return done(null, false, {
          message: 'This email is registered manually. Please login using email and password.'
        });

      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
