require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

require('./auth/passport');

const authRoutes = require('./auth/authRoutes');
const gmailRoutes = require('./gmail/gmailRoutes');
const agentRoutes = require('./routes/agentRoutes');

const app = express();

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected to Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,                 // ← CRITICAL: allows cookies cross-origin
  })
);

// ─── Session Middleware (MUST come before passport) ──────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 7,          // 7 days
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: false,                   // ← MUST be false on localhost (no HTTPS)
      sameSite: 'lax',                 // ← allows redirect-based OAuth cookies
    },
  })
);

// ─── Passport (MUST come after session) ──────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());           // ← restores req.user from session

// ─── Debug Middleware (remove in production) ──────────────────────────────────
app.use((req, _res, next) => {
  if (req.path.startsWith('/auth') || req.path === '/health') {
    console.log(`[${req.method}] ${req.path} | sessionID: ${req.sessionID} | user: ${req.user?.email || 'none'}`);
  }
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/gmail', gmailRoutes);
app.use('/agent', agentRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    user: req.user ? req.user.email : null,
    sessionID: req.sessionID,
    timestamp: new Date().toISOString(),
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Mail Agent backend running on http://localhost:${PORT}`);
});

module.exports = app;
