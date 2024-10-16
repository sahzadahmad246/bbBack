const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

module.exports = (passport) => {
 
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile); 
          const existingUser = await User.findOne({ googleId: profile.id });

          
          if (existingUser) {
            return done(null, existingUser);
          }

         
          const image =
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : "";

          
          const newUser = await new User({
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: image, 
            email: profile.emails[0].value,
          }).save();

          done(null, newUser); 
        } catch (error) {
          console.error("Error in Google Strategy:", error);
          done(error, null);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        console.error("Error deserializing user:", error);
        done(error, null);
      });
  });
};
