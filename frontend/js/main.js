/* ══════════════════════════════════════════════════════════
   InternAI — Main JavaScript
   Handles: Nav, Upload, API calls, UI interactions
══════════════════════════════════════════════════════════ */

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';   // Vercel serverless API routes

/* ── Utility ───────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = '<span class="toast-dot"></span><span class="toast-msg"></span>';
    document.body.appendChild(toast);
  }
  const dot = toast.querySelector('.toast-dot');
  const msgEl = toast.querySelector('.toast-msg');
  dot.style.background = type === 'success' ? 'var(--green)' : 'var(--red)';
  msgEl.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function getToken() { return localStorage.getItem('intern_token'); }
function setToken(t) { localStorage.setItem('intern_token', t); }
function getUser()  { return JSON.parse(localStorage.getItem('intern_user') || 'null'); }
function setUser(u) { localStorage.setItem('intern_user', JSON.stringify(u)); }
function logout()   {
  localStorage.removeItem('intern_token');
  localStorage.removeItem('intern_user');
  window.location.href = '/pages/login.html';
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers
    },
    ...opts
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

/* ── NAV hamburger ─────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const links = $('.nav-links');
    if (links) {
      const open = links.style.display === 'flex';
      links.style.cssText = open
        ? ''
        : 'display:flex;flex-direction:column;position:fixed;top:64px;left:0;right:0;background:var(--bg-2);padding:24px;border-bottom:1px solid var(--border);gap:12px;z-index:99';
    }
    const sidebar = $('.sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  });
}

/* ── Auth Guard ─────────────────────────────────────────── */
function requireAuth() {
  if (!getToken()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

/* ── Scroll animations ─────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation = 'fadeUp .6s ease both';
      e.target.style.opacity = '1';
    }
  });
}, { threshold: 0.1 });

$$('.feature-card, .step, .stat-card').forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

/* ── Progress bar animate ──────────────────────────────── */
function animateProgress(el, pct) {
  const fill = el.querySelector('.progress-fill');
  if (fill) {
    fill.style.width = '0%';
    setTimeout(() => { fill.style.width = pct + '%'; }, 100);
  }
}

/* ── Number counter animate ────────────────────────────── */
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = target / 50;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString() + suffix;
  }, 30);
}

/* ── Skills chip render ─────────────────────────────────── */
function renderSkillChip(skill, confidence) {
  const pct = Math.round(confidence * 100);
  const colors = {
    programming_languages: '--accent',
    web_frontend: '--blue',
    web_backend: '--teal',
    databases: '--orange',
    ai_ml: '--purple',
    cloud_devops: '--green',
    data_engineering: '--yellow',
    tools_platforms: '--text-2',
    cybersecurity: '--red',
    soft_skills: '--text-2'
  };
  return `<span class="skill-tag" style="background:rgba(var(--chip-bg,99,102,241),.12);color:var(${colors[skill.category]||'--text-2'});border:1px solid rgba(var(--chip-bg,99,102,241),.2)">
    ${skill.skill}
    <span class="skill-conf">${pct}%</span>
  </span>`;
}

/* ── Match score ring update ───────────────────────────── */
function updateScoreRing(pct) {
  const circle = document.querySelector('.score-ring circle:last-child');
  if (!circle) return;
  const r = 25, c = 2 * Math.PI * r;
  const fill = (pct / 100) * c;
  circle.style.strokeDasharray = `${fill} ${c}`;
}

/* ── File drag & drop ──────────────────────────────────── */
function initUploadZone(zoneId, inputId, onFile) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    if (input.files[0]) onFile(input.files[0]);
  });
  zone.addEventListener('dragover', e => {
    e.preventDefault(); zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  });
}

/* ── Upload & analyze resume ───────────────────────────── */
async function uploadResume(file) {
  const zone = document.getElementById('uploadZone');
  const resultsSection = document.getElementById('resultsSection');
  if (!zone) return;

  // Show loading
  zone.innerHTML = `
    <div class="spinner" style="margin:0 auto"></div>
    <p style="margin-top:16px;color:var(--text-2)">Analyzing your resume with AI...</p>
  `;

  try {
    const formData = new FormData();
    formData.append('resume', file);

    const token = getToken();
    const res = await fetch(API_BASE + '/resume/analyze', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Analysis failed');

    // Reset upload zone
    zone.innerHTML = `
      <div class="upload-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M7 18H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1" stroke="var(--green)" stroke-width="1.8" stroke-linecap="round"/></svg>
      </div>
      <h3>✅ ${file.name}</h3>
      <p>${data.skills?.total_skills_found || 0} skills extracted · ATS Score: ${data.ats_score?.total_score || 0}/100</p>
    `;

    showToast('Resume analyzed successfully!');
    renderResults(data);

    if (resultsSection) {
      resultsSection.style.display = 'block';
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  } catch (err) {
    zone.innerHTML = `
      <div class="upload-icon" style="background:rgba(239,68,68,.1)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M12 3l9 16H3L12 3z" stroke="var(--red)" stroke-width="1.8" stroke-linecap="round"/></svg>
      </div>
      <h3>Upload failed</h3>
      <p>${err.message}</p>
      <span class="btn-upload" onclick="location.reload()">Try Again</span>
    `;
    showToast(err.message, 'error');
  }
}

/* ── Render analysis results ───────────────────────────── */
function renderResults(data) {
  const skillsPanel = document.getElementById('skillsPanel');
  const recommendationsGrid = document.getElementById('recommendationsGrid');

  // Skills panel
  if (skillsPanel && data.skills) {
    const byCategory = data.skills.by_category || {};
    let html = '';
    for (const [cat, items] of Object.entries(byCategory)) {
      if (!items.length) continue;
      const label = cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      html += `<div class="skill-category">
        <h4>${label}</h4>
        <div class="skill-tags">
          ${items.slice(0, 10).map(i => renderSkillChip(
            { skill: i.skill, category: cat },
            i.confidence
          )).join('')}
        </div>
      </div>`;
    }
    const panel = skillsPanel.querySelector('.skills-panel-body');
    if (panel) panel.innerHTML = html || '<p style="color:var(--text-2);font-size:.85rem">No skills extracted. Try a more detailed resume.</p>';

    // ATS score
    const atsEl = document.getElementById('atsScore');
    if (atsEl && data.ats_score) {
      atsEl.textContent = data.ats_score.total_score + '/100';
      const grade = document.getElementById('atsGrade');
      if (grade) grade.textContent = data.ats_score.grade;
    }

    // Progress bars
    const breakdown = data.ats_score?.breakdown || {};
    for (const [key, val] of Object.entries(breakdown)) {
      const el = document.getElementById('prog-' + key);
      if (el) animateProgress(el.closest('.progress-wrap'), (val / 35) * 100);
    }
  }

  // Recommendations
  if (recommendationsGrid && data.recommendations) {
    const recs = data.recommendations.top_recommendations || [];
    recommendationsGrid.innerHTML = recs.map(r => renderInternCard(r)).join('');
  }
}

/* ── Render internship card ─────────────────────────────── */
function renderInternCard(r) {
  const colors = ['#6366f1','#22c55e','#f59e0b','#ec4899','#0ea5e9','#a855f7'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const initials = r.company?.split(' ').map(w=>w[0]).join('').slice(0,2) || 'IN';
  const matched = (r.matched_skills||[]).slice(0,4);
  const missing = (r.missing_skills||[]).slice(0,2);

  return `
  <div class="intern-card" onclick="openInternModal(${JSON.stringify(r).replace(/"/g,'&quot;')})">
    <div class="intern-card-top">
      <div class="intern-logo" style="background:${color}22;color:${color}">${initials}</div>
      <div>
        <div class="intern-title">${r.title}</div>
        <div class="intern-company">${r.company}</div>
      </div>
      <div style="margin-left:auto">
        <span style="background:rgba(99,102,241,.1);color:var(--accent-2);padding:4px 10px;border-radius:6px;font-size:.72rem;font-weight:700">
          #${r.rank}
        </span>
      </div>
    </div>
    <div class="intern-meta">
      <span class="meta-tag">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1a3 3 0 100 6A3 3 0 006 1zM2 10c0-2 1.8-3 4-3s4 1 4 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        ${r.location}
      </span>
      <span class="meta-tag">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.2"/><path d="M6 4v2l1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        ${r.duration}
      </span>
      <span class="meta-tag" style="color:var(--green)">
        💰 ${r.stipend}
      </span>
    </div>
    <div class="intern-skills">
      ${matched.map(s=>`<span class="chip chip--green">${s}</span>`).join('')}
      ${missing.map(s=>`<span class="chip chip--red">${s} ✗</span>`).join('')}
    </div>
    <div class="intern-card-bottom">
      <div class="match-score">
        <div class="match-bar">
          <div class="match-fill" style="width:${r.match_score}%"></div>
        </div>
        <span class="match-pct">${r.match_score}%</span>
      </div>
      <button class="btn-apply" onclick="event.stopPropagation()">Apply Now</button>
    </div>
  </div>`;
}

/* ── Login handler ─────────────────────────────────────── */
async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Logging in...'; btn.disabled = true;
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      })
    });
    setToken(data.token);
    setUser(data.user);
    showToast('Welcome back, ' + data.user.name + '!');
    setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 800);
  } catch (err) {
    showToast(err.message, 'error');
    btn.textContent = 'Login'; btn.disabled = false;
  }
}

/* ── Register handler ──────────────────────────────────── */
async function handleRegister(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const pwd = document.getElementById('password').value;
  const cpwd = document.getElementById('confirm_password').value;
  if (pwd !== cpwd) { showToast('Passwords do not match', 'error'); return; }
  btn.textContent = 'Creating account...'; btn.disabled = true;
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: pwd,
        college: document.getElementById('college')?.value,
        branch: document.getElementById('branch')?.value
      })
    });
    setToken(data.token);
    setUser(data.user);
    showToast('Account created! Welcome to InternAI 🎉');
    setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 800);
  } catch (err) {
    showToast(err.message, 'error');
    btn.textContent = 'Create Account'; btn.disabled = false;
  }
}

/* ── Load dashboard data ───────────────────────────────── */
async function loadDashboard() {
  if (!requireAuth()) return;
  const user = getUser();
  if (user) {
    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = user.name?.split(' ')[0] || 'Student';
  }
  try {
    const data = await apiFetch('/dashboard');
    if (data.stats) {
      const el = id => document.getElementById(id);
      if (el('statSkills')) animateCounter(el('statSkills'), data.stats.total_skills || 0);
      if (el('statMatches')) animateCounter(el('statMatches'), data.stats.matches || 0);
      if (el('statScore')) animateCounter(el('statScore'), data.stats.ats_score || 0, '/100');
      if (el('statApplied')) animateCounter(el('statApplied'), data.stats.applied || 0);
    }
    if (data.recommendations) renderResults(data);
  } catch (err) {
    console.warn('Dashboard load error:', err.message);
  }
}

/* ── Load all internships ──────────────────────────────── */
async function loadInternships(filters = {}) {
  const grid = document.getElementById('allInternshipsGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="spinner" style="margin:40px auto"></div>';
  try {
    const qs = new URLSearchParams(filters).toString();
    const data = await apiFetch('/internships?' + qs);
    const internships = data.internships || [];
    if (!internships.length) {
      grid.innerHTML = '<p style="color:var(--text-2);text-align:center;padding:40px">No internships found.</p>';
      return;
    }
    grid.innerHTML = internships.map(r => renderInternCard(r)).join('');
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--red);text-align:center;padding:40px">${err.message}</p>`;
  }
}

/* ── Expose globals ────────────────────────────────────── */
window.InternAI = {
  showToast, logout, uploadResume, handleLogin, handleRegister,
  loadDashboard, loadInternships, initUploadZone, renderInternCard
};
