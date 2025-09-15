
import express from "express";
import passport from "../config/passport.js"; 

const router = express.Router();


router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure", session: true }),
  (req, res) => {
    const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";
    console.log("redirecting to dashboard");
    res.redirect(`${FRONTEND}/dashboard`);
  }
);

router.get("/me", (req, res) => {
  if (!req.user) {
    console.log(req);
    return res.status(401).json({ loggedIn: false });
  }
  return res.json({ loggedIn: true, user: req.user });
});


router.get("/failure", (_req, res) => {
  res.status(401).send("Google login failed");
});


router.get("/logout", (req, res) => {
  const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";
  req.logout(() => {
    res.redirect(FRONTEND);
  });
});

export default router;


