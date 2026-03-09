/**
 * backend/routes/dashboard.js
 */
const express = require('express');
const router  = express.Router();
const authMW  = require('../middleware/auth');

router.get('/', authMW, (req, res) => {
  res.json({
    success: true,
    stats: {
      total_skills: 0,
      matches: 0,
      ats_score: 0,
      applied: 0
    },
    message: 'Upload your resume to see your personalized stats'
  });
});

module.exports = router;
