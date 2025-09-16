import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Trigger Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
// Google callback - Add debug logging
// Google callback with detailed token logging
router.get(
  "/google/callback",
  passport.authenticate("google", { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/login` 
  }),
  (req, res) => {
    console.log("🎯 Google OAuth Successful!");
    console.log("👤 User object:", req.user);
    console.log("🔑 Generated token:", req.user.token);
    console.log("📏 Token length:", req.user.token.length);
    console.log("📍 Redirecting to:", `${process.env.FRONTEND_URL}/dashboard?token=${req.user.token}`);
    
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${req.user.token}`);
  }
);
// JWT-based /auth/me
// JWT-based /auth/me with detailed error logging
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  
  console.log("🔹 /auth/me called, auth header:", authHeader);
  
  if (!authHeader) {
    console.log("❌ No authorization header");
    return res.status(401).json({ error: "No token provided" });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log("❌ Invalid authorization format:", authHeader);
    return res.status(401).json({ error: "Invalid token format" });
  }

  const token = parts[1];
  console.log("🔹 Extracted token:", token);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified successfully:", decoded);
    res.json({ loggedIn: true, user: decoded });
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    console.error("❌ Token that failed:", token);
    console.error("❌ JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    res.status(401).json({ 
      error: "Invalid token",
      details: err.message 
    });
  }
});

export default router;


