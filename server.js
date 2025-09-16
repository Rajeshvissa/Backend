import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import vendorRoutes from "./routes/vendor.js";
import receiptsRoutes from "./routes/receipts.js";
import communicationRoutes from "./routes/communicationRoutes.js";

dotenv.config();
const app = express();

// --- Middleware ---
app.use(cookieParser());
app.use(express.json());



const FRONTEND = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: [FRONTEND], // allow only frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicit preflight handling
// app.options("*", cors({
//   origin: [FRONTEND],
//   credentials: true,
// }));

// --- Session ---

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    proxy: true, // important for HTTPS on Render
    cookie: {
      secure: true,          // must be true on Render (HTTPS)
      sameSite: "none",      // allow cross-site cookie
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);


// --- Passport ---
app.use(passport.initialize());
app.use(passport.session());
console.log(passport.session());

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/receipts", receiptsRoutes);
app.use("/communication", communicationRoutes);

// --- Database ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



