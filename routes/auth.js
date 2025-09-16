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
router.get(
  "/google/callback",
  passport.authenticate("google", { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/login` 
  }),
  (req, res) => {
    const FRONTEND = process.env.FRONTEND_URL;
    // Send token in URL query
    res.redirect(`${FRONTEND}/dashboard?token=${req.user.token}`);
  }
);

// JWT-based /auth/me
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Check if it's Bearer token format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: "Invalid token format" });
  }

  const token = parts[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ loggedIn: true, user: decoded });
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
