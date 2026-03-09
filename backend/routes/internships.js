/**
 * backend/routes/internships.js
 * Browse, search & filter internships
 */
const express = require('express');
const router  = express.Router();
const authMW  = require('../middleware/auth');

const INTERNSHIPS = require('../../database/internships.json');

/**
 * GET /api/internships
 * Query: search, domain, location, duration, sort
 */
router.get('/', (req, res) => {
  let data = [...INTERNSHIPS];
  const { search, domain, location, duration, sort } = req.query;

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.company.toLowerCase().includes(q) ||
      i.required_skills.join(' ').includes(q)
    );
  }
  if (domain)   data = data.filter(i => i.domain === domain);
  if (location) data = data.filter(i => i.location.toLowerCase().includes(location.toLowerCase()));
  if (duration) data = data.filter(i => i.duration.startsWith(duration));

  if (sort === 'stipend') {
    data.sort((a, b) => parseInt(b.stipend.replace(/\D/g,'')) - parseInt(a.stipend.replace(/\D/g,'')));
  } else if (sort === 'duration') {
    data.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
  }

  res.json({ success: true, count: data.length, internships: data });
});

/**
 * GET /api/internships/:id
 */
router.get('/:id', (req, res) => {
  const intern = INTERNSHIPS.find(i => i.id === req.params.id);
  if (!intern) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, internship: intern });
});

module.exports = router;
