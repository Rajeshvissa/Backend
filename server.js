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
