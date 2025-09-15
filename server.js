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


















import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";

import passport from "./config/passport.js";

import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import vendorRoutes from "./routes/vendor.js";
import receiptsRoutes from "./routes/receipts.js";
import communicationRoutes from "./routes/communicationRoutes.js";

dotenv.config();

const app = express();

// ---- Core middleware (ORDER MATTERS) ----
app.use(cookieParser());

// Allow your frontend to send/receive the session cookie
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// ---- Session & Passport ----
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "mini-crm-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",   // allows cookie across localhost:5000 ↔ 5173
      secure: false,     // keep false on http; set true only behind HTTPS
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// // ---- Rate limiters ----
// const campaignsLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message: { error: "Too many campaign requests, please slow down." },
// });

const receiptsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many receipt requests, please slow down." },
});

// ---- Routes ----
app.use("/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/receipts", receiptsLimiter, receiptsRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/communication", communicationRoutes);

// ---- Database ----
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ---- Start server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
