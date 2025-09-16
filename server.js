import express from "express";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Trigger Google login
console.log("Starting server...");
console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);
console.log("JWT_SECRET =", process.env.JWT_SECRET);
console.log("FRONTEND_URL =", process.env.FRONTEND_URL);
console.log("MONGO_URI =", process.env.MONGO_URI);
console.log("SESSION_SECRET =", process.env.SESSION_SECRET);


router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: process.env.FRONTEND_URL }),
  (req, res) => {
    console.log("🔹 Google callback user:", req.user);

    const FRONTEND = process.env.FRONTEND_URL;
    console.log("🔹 Redirecting to frontend with token");
    res.redirect(`${FRONTEND}/dashboard?token=${req.user.token}`);
  }
);

// JWT-based /auth/me
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("🔹 Authorization header:", authHeader);

  if (!authHeader) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔹 Extracted token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ JWT decoded:", decoded);
    res.json({ loggedIn: true, user: decoded });
  } catch (err) {
    console.log("❌ JWT verification failed:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Optional: logout route
router.get("/logout", (req, res) => {
  const FRONTEND = process.env.FRONTEND_URL;
  console.log("🔹 Logging out user");
  res.redirect(FRONTEND);
});

export default router;


