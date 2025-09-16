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
  passport.authenticate("google", { session: false, failureRedirect: process.env.FRONTEND_URL }),
  (req, res) => {
    // Redirect frontend with JWT
    const FRONTEND = process.env.FRONTEND_URL;
    res.redirect(`${FRONTEND}/dashboard?token=${req.user.token}`);
  }
);

// JWT-based /auth/me
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ loggedIn: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
