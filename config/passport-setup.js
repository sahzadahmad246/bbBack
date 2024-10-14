const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel'); 

module.exports = (passport) => { // Export as a function
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(profile); // Log the profile to check its structure
      const existingUser = await User.findOne({ googleId: profile.id });
      
      // Check if user already exists
      if (existingUser) {
        return done(null, existingUser);
      }
      
      // Get image URL from profile photos if available
      const image = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '';

      // Create a new user in the database
      const newUser = await new User({
        googleId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        image: image, // Store the image URL
        email: profile.emails[0].value,
      }).save();
      
      done(null, newUser); // Complete authentication
    } catch (error) {
      console.error("Error in Google Strategy:", error);
      done(error, null);
    }
  }));

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(error => {
        console.error("Error deserializing user:", error);
        done(error, null);
      });
  });
};
