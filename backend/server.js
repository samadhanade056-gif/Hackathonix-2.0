/**
 * ═══════════════════════════════════════════════════════════
 *  InternAI — Express.js Backend Server
 *  File: backend/server.js
 * ═══════════════════════════════════════════════════════════
 */

const express    = require('express');
const cors       = require('cors');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const resumeRoutes    = require('./routes/resume');
const internRoutes    = require('./routes/internships');
const dashboardRoutes = require('./routes/dashboard');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Middleware ─────────────────────────────────────────── */
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ── Serve frontend static files ────────────────────────── */
app.use(express.static(path.join(__dirname, '../frontend')));

/* ── Ensure uploads directory exists ────────────────────── */
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

/* ── API Routes ─────────────────────────────────────────── */
app.use('/api/auth',        authRoutes);
app.use('/api/resume',      resumeRoutes);
app.use('/api/internships', internRoutes);
app.use('/api/dashboard',   dashboardRoutes);

/* ── Health check ───────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

/* ── Catch-all: serve frontend SPA ─────────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

/* ── Error handler ──────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 InternAI server running on http://localhost:${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api`);
  console.log(`   Frontend: http://localhost:${PORT}\n`);
});

module.exports = app;
