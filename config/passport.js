import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      // minimal user object
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
      };
      done(null, user);
    }
  )
);

// Serialize user to session
passport.serializeUser((user, done) => {
  console.log("🔹 Serializing user:", user);
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  console.log("🔹 Deserializing user from session:", obj);
  done(null, obj);
});

export default passport;

