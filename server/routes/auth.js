const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/notifier');

const router = express.Router();

const emailConfigured = () => !!process.env.SMTP_HOST;

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registration attempts, please try again later' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (emailConfigured()) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await User.create({
        email: email.toLowerCase(),
        passwordHash,
        verificationToken,
        verificationTokenExpiry,
      });
      await sendVerificationEmail(email.toLowerCase(), verificationToken);
      res.status(201).json({ message: 'Verification email sent. Check your inbox.' });
    } else {
      const user = await User.create({
        email: email.toLowerCase(),
        passwordHash,
        emailVerified: true,
      });
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, email: user.email, role: user.role });
    }
  } catch (err) {
    console.error('[Register]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (emailConfigured() && !user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    res.redirect(`${baseUrl}/login?verified=true`);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/resend-verification', resendLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), emailVerified: false });
    if (user) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = verificationToken;
      user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      await sendVerificationEmail(user.email, verificationToken);
    }

    res.json({ message: 'If an account with that email exists and is unverified, a new verification email has been sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
