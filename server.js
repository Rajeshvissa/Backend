// backend/src/server.js
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import authRoutes from "./routes/auth.js";

const app = express();

// === CORS ===
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: false, // JWT flow doesn't use cookies
  })
);

app.use(express.json());
app.use(passport.initialize());

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

// === Routes ===
app.use("/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
