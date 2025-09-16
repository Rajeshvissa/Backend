import express from "express";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// ---- Core middleware ----
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "none", secure: true, maxAge: 86400000 }
}));

// ---- Passport ----
app.use(passport.initialize());
app.use(passport.session());

// ---- Routes ----
app.use("/auth", authRoutes);

// ---- Test route ----
app.get("/", (_req, res) => res.send("Hello Render!"));

// ---- Start server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
