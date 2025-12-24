const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:4000/auth/google/callback',
}, async (token, tokenSecret, profile, done) => {
  try {
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
      return done(null, existingUser); // User exists, log them in
    }

    // Create a new user with Google profile data
    const newUser = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      provider: 'google',
    });

    await newUser.save();
    done(null, newUser);
  } catch (error) {
    console.error(error);
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
