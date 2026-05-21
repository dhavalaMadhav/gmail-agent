const express = require('express');
const passport = require('passport');
const router = express.Router();

// ─── Initiate Google OAuth ────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    accessType: 'offline',
    prompt: 'consent',
  })
);

// ─── Google OAuth Callback ────────────────────────────────────────────────────
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// ─── Logout ───────────────────────────────────────────────────────────────────
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

// ─── Get Current User ─────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false, user: null });
  }
  const { googleId, accessToken, refreshToken, ...safeUser } =
    req.user.toObject();
  res.json({ authenticated: true, user: safeUser });
});

module.exports = router;
