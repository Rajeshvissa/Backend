// backend/src/server.js
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const app = express();

// === CORS ===
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g., "https://frontend-five-cyan-78.vercel.app"
    credentials: false, // JWT flow doesn't need cookies
  })
);

// === Passport Google Strategy ===
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
      };

      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });
      done(null, { user, token });
    }
  )
);

app.use(passport.initialize());

// === Routes ===

// Trigger Google login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: process.env.FRONTEND_URL }),
  (req, res) => {
    // Redirect to frontend with JWT
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${req.user.token}`);
  }
);

// Example protected API route
app.get("/auth/api", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));

