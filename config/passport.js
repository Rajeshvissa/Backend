// In your passport config (passport.js)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user logic here
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value
      };

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          name: user.name 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Add expiration
      );

      console.log("🔹 Generated token:", token);
      
      return done(null, { user, token });
    } catch (error) {
      return done(error, null);
    }
  }
));
