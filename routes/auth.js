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
    res.redirect(`${FRONTEND}/dashboard`); // cookie automatically sent
  }
);

// Get logged-in user
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ loggedIn: false });
  }
  res.json({ loggedIn: true, user: req.user });
});

// Logout
router.get("/logout", (req, res) => {
  const FRONTEND = process.env.FRONTEND_URL;
  req.logout(() => {
    res.redirect(FRONTEND);
  });
});

// Failure
router.get("/failure", (_req, res) => {
  res.status(401).send("Google login failed");
});

export default router;
