/**
 * backend/routes/auth.js
 * User Registration & Login
 */
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const router   = express.Router();

const SECRET = process.env.JWT_SECRET || 'internai_secret_2025';

// In-memory user store (replace with MongoDB in production)
const users = [];

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college, branch } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    if (users.find(u => u.email === email))
      return res.status(409).json({ success: false, message: 'Email already registered' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: 'u_' + Date.now(),
      name, email, college: college || '', branch: branch || '',
      password: hashed,
      createdAt: new Date().toISOString(),
      skills: [], atsScore: 0
    };
    users.push(user);

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;

    res.status(201).json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = users.find(u => u.email === email);
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;

    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/auth/me
 */
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

module.exports = router;
