import express from "express";
import passport from "passport";

const router = express.Router();

// Trigger Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure", session: true }),
  (req, res) => {
    const FRONTEND = process.env.FRONTEND_URL;
    console.log("✅ Google login success, user:", req.user);

    // Force session save before redirect
    req.session.save(err => {
      if (err) {
        console.error("❌ Session save error:", err);
      }
      console.log("✅ Session saved, redirecting to frontend...");
      res.redirect(`${FRONTEND}/dashboard`);
    });
  }
);


// Get logged-in user
router.get("/me", (req, res) => {
  console.log("🔹 /auth/me hit. User:", req.user);
  if (!req.user) {
    console.log("❌ No user in session");
    return res.status(401).json({ loggedIn: false });
  }
  res.json({ loggedIn: true, user: req.user });
});

// Logout
router.get("/logout", (req, res) => {
  const FRONTEND = process.env.FRONTEND_URL;
  req.logout(() => {
    req.session.destroy(() => {
      console.log("✅ User logged out, session destroyed");
      res.redirect(FRONTEND);
    });
  });
});

// Failure
router.get("/failure", (_req, res) => {
  res.status(401).send("Google login failed");
});

export default router;

