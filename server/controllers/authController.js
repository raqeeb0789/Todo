const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Configure transporter using environment vars; fallback to JSON transport in development
let transporter;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  const port = Number(process.env.EMAIL_PORT) || 587;
  const secure = typeof process.env.EMAIL_SECURE !== 'undefined'
    ? process.env.EMAIL_SECURE === 'true'
    : port === 465; // auto-secure for 465
  const tls = {};
  if (typeof process.env.EMAIL_TLS_REJECT_UNAUTH !== 'undefined') {
    tls.rejectUnauthorized = process.env.EMAIL_TLS_REJECT_UNAUTH !== 'false';
  }
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls
  });
  // Verify SMTP connectivity on startup
  transporter.verify().then(() => {
    console.log('[Mail] SMTP transporter verified');
  }).catch((e) => {
    console.warn('[Mail] SMTP transporter verification failed:', e?.message || e);
  });
} else {
  // Local/dev fallback: do not send real email, just log JSON
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No user with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Todo App - Password Reset',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
      html: `<p>You requested a password reset. Click the link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`
    };

    const info = await transporter.sendMail(mailOptions);
    // In local/dev fallback, include resetLink for convenience
    const response = { ok: true };
    if (info && info.messageId === undefined && (!process.env.EMAIL_HOST)) {
      response.resetLink = resetLink;
      response.note = 'Email not configured; using JSON transport. Use resetLink directly.';
    }
    res.json(response);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const user = await User.findOne({ email, resetToken: token, resetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = password; // will be hashed in pre-save
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
