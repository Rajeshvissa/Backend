import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("🔹 Google profile received:", profile);
      
      // Find or create user in your database here
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0]?.value
      };

      // Generate JWT token (BACKEND ONLY knows the secret!)
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          name: user.name 
        },
        process.env.JWT_SECRET, // ← Secret stays on backend
        { expiresIn: '7d' }
      );

      console.log("✅ JWT token generated successfully");
      
      return done(null, { user, token });
    } catch (error) {
      console.error("❌ Passport error:", error);
      return done(error, null);
    }
  }
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Export passport
export default passport; // ← THIS WAS MISSING!
