// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import customerRoutes from "./routes/customerRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import campaignRoutes from "./routes/campaignRoutes.js";
// import vendorRoutes from "./routes/vendor.js";
// import receiptsRoutes from "./routes/receipts.js";
// import session from "express-session";
// import passport from "./config/passport.js";
// import authRoutes from "./routes/auth.js";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import communicationRoutes from "./routes/communicationRoutes.js";
// import rateLimit from "express-rate-limit";

// dotenv.config();
// const app = express();

// // --- Core middlewares ---
// // --- Core middlewares ---
// app.use(cookieParser());

// // ✅ Allow frontend & Google redirects
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173", // your frontend
//       "http://localhost:5000", // backend self
//     ],
//     credentials: true,
//   })
// );

// app.use(express.json());


// // --- Session & Passport ---
// app.use(
//   session({
//     name: "connect.sid", // ✅ explicit cookie name
//     secret: process.env.SESSION_SECRET || "mini-crm-secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       sameSite: "lax", // ✅ allows cookies across localhost ports
//       secure: false,   // ✅ keep false for http://localhost
//       maxAge: 24 * 60 * 60 * 1000,
//     },
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// // --- Rate limiters ---
// const campaignsLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // max 10 campaign creations in 15 mins per IP
//   message: { error: "Too many campaign requests, please slow down." },
// });

// const receiptsLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 60, // allow up to 60 receipts/minute per IP
//   message: { error: "Too many receipt requests, please slow down." },
// });

// // --- Routes ---
// app.use("/auth", authRoutes);
// app.use("/api/campaigns", campaignsLimiter, campaignRoutes);
// app.use("/api/vendor", vendorRoutes);
// app.use("/api/receipts", receiptsLimiter, receiptsRoutes);
// app.use("/customers", customerRoutes);
// app.use("/orders", orderRoutes);
// app.use("/communication", communicationRoutes);

// // --- Database ---
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

// // --- Start server ---
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


















// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import session from "express-session";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import rateLimit from "express-rate-limit";

// import passport from "./config/passport.js";

// import authRoutes from "./routes/auth.js";
// import customerRoutes from "./routes/customerRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import campaignRoutes from "./routes/campaignRoutes.js";
// import vendorRoutes from "./routes/vendor.js";
// import receiptsRoutes from "./routes/receipts.js";
// import communicationRoutes from "./routes/communicationRoutes.js";

// dotenv.config();

// const app = express();

// // ---- Core middleware (ORDER MATTERS) ----
// app.use(cookieParser());

// // Allow your frontend to send/receive the session cookie
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     credentials: true,
//   })
// );

// // Parse JSON bodies
// app.use(express.json());

// // ---- Session & Passport ----
// app.use(
//   session({
//     name: "connect.sid",
//     secret: process.env.SESSION_SECRET || "mini-crm-secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//   httpOnly: true,
//   sameSite: "none",   // required for cross-site cookies
//   secure: true,       // required when using https (Render + Vercel use https)
//   maxAge: 24 * 60 * 60 * 1000,
// },

//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// // // ---- Rate limiters ----
// // const campaignsLimiter = rateLimit({
// //   windowMs: 15 * 60 * 1000,
// //   max: 10,
// //   message: { error: "Too many campaign requests, please slow down." },
// // });

// const receiptsLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 60,
//   message: { error: "Too many receipt requests, please slow down." },
// });

// // ---- Routes ----
// app.use("/auth", authRoutes);
// app.use("/api/campaigns", campaignRoutes);
// app.use("/api/vendor", vendorRoutes);
// app.use("/api/receipts", receiptsLimiter, receiptsRoutes);
// app.use("/customers", customerRoutes);
// app.use("/orders", orderRoutes);
// app.use("/communication", communicationRoutes);

// // ---- Database ----
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

// // ---- Start server ----
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


import express from "express";
import passport from "passport";
import session from "express-session"; // optional, not used for JWT
import cors from "cors";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const app = express();

// === CORS ===
app.use(
  cors({
    origin: "https://frontend-five-cyan-78.vercel.app", // your frontend URL
    credentials: true, // not needed for JWT but safe
  })
);

// === Passport Google Strategy ===
passport.use(
  new GoogleStrategy(
    {
      clientID: "YOUR_GOOGLE_CLIENT_ID",
      clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Minimal user object
      const user = { id: profile.id, name: profile.displayName, email: profile.emails[0].value };

      // Create JWT
      const token = jwt.sign(user, "YOUR_SECRET_KEY", { expiresIn: "1d" });

      done(null, { user, token });
    }
  )
);

// Initialize passport
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
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Redirect frontend with JWT
    res.redirect(`https://frontend-five-cyan-78.vercel.app/dashboard?token=${req.user.token}`);
  }
);

// Protected API example
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "YOUR_SECRET_KEY");
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
