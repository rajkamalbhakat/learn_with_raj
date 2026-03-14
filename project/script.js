// ============================================================
//  NoteVault — script.js
//  All interactivity for the Student Notes Platform
// ============================================================

// ── SAMPLE DATA ─────────────────────────────────────────────
const notes = [
  {
    id: 1, title: 'Complete Pointer Notes',
    subject: 'C Programming', topic: 'Pointers', type: 'pdf',
    author: 'Arjun S.', university: 'VTU', stars: 4.9, downloads: 1523,
    desc: 'Full pointer theory with examples and memory diagrams.',
    tags: ['Pointers', 'C', 'Sem 1'], date: '2024-01-10'
  },
  {
    id: 2, title: 'Binary Tree Handwritten Notes',
    subject: 'DSA', topic: 'Binary Tree', type: 'img',
    author: 'Priya K.', university: 'SPPU', stars: 4.7, downloads: 892,
    desc: 'Clear handwritten notes covering all BST operations.',
    tags: ['BST', 'DSA', 'Sem 3'], date: '2024-01-15'
  },
  {
    id: 3, title: 'Integration Cheat Sheet',
    subject: 'Maths', topic: 'Integration', type: 'pdf',
    author: 'Rahul M.', university: 'DU', stars: 4.8, downloads: 2201,
    desc: 'All integration formulas in one page — exam gold!',
    tags: ['Calculus', 'Maths', 'Sem 2'], date: '2024-01-08'
  },
  {
    id: 4, title: 'SQL Joins Explained',
    subject: 'DBMS', topic: 'SQL Joins', type: 'text',
    author: 'Sneha P.', university: 'MU', stars: 4.5, downloads: 643,
    desc: 'Visual explanation of INNER, LEFT, RIGHT, FULL joins.',
    tags: ['SQL', 'DBMS', 'Sem 4'], date: '2024-01-20'
  },
  {
    id: 5, title: 'Linked List Masterclass',
    subject: 'DSA', topic: 'Linked List', type: 'pdf',
    author: 'Dev T.', university: 'VTU', stars: 4.6, downloads: 1100,
    desc: 'Single, double, circular linked list — all covered.',
    tags: ['Linked List', 'DSA', 'Sem 3'], date: '2024-01-18'
  },
  {
    id: 6, title: 'Newton Laws + Derivations',
    subject: 'Physics', topic: 'Mechanics', type: 'img',
    author: 'Aisha R.', university: 'BITS', stars: 4.4, downloads: 789,
    desc: 'All three laws with derivations and numerical problems.',
    tags: ['Physics', 'Mechanics', 'Sem 1'], date: '2024-01-22'
  },
];

const uploaders = [
  { name: 'Arjun Sharma',   sub: 'VTU · 48 uploads',  score: '4.9★', color: '#7c6ff7', init: 'AS' },
  { name: 'Priya Kulkarni', sub: 'SPPU · 39 uploads', score: '4.8★', color: '#2dd4bf', init: 'PK' },
  { name: 'Rahul Mehta',    sub: 'DU · 31 uploads',   score: '4.7★', color: '#fb7185', init: 'RM' },
  { name: 'Sneha Patil',    sub: 'MU · 28 uploads',   score: '4.6★', color: '#fbbf24', init: 'SP' },
];

const helpful = [
  { name: 'Integration Cheat Sheet', sub: 'Maths · 2,201 downloads', score: '4.8★', color: '#4ade80', init: '📄' },
  { name: 'Pointer Notes PDF',       sub: 'C Prog · 1,523 downloads',score: '4.9★', color: '#7c6ff7', init: '📘' },
  { name: 'Linked List Master',      sub: 'DSA · 1,100 downloads',   score: '4.6★', color: '#f97316', init: '📗' },
  { name: 'Binary Tree Notes',       sub: 'DSA · 892 downloads',     score: '4.7★', color: '#2dd4bf', init: '🌲' },
];

// ── STATE ────────────────────────────────────────────────────
let currentSubject = '';
let currentSort    = 'rating';
let isDark         = true;

// ── HELPERS ─────────────────────────────────────────────────
function renderStars(n) {
  const full = Math.floor(n);
  const half = n % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}
function typeClass(t) {
  return t === 'pdf' ? 'type-pdf' : t === 'img' ? 'type-img' : 'type-text';
}
function typeLabel(t) {
  return t === 'pdf' ? 'PDF' : t === 'img' ? 'Image' : 'Text';
}

// ── NOTES RENDERING ──────────────────────────────────────────
function getFilteredNotes() {
  const q = document.getElementById('main-search').value.toLowerCase().trim();

  let list = notes.filter(n => {
    const matchSubj = !currentSubject || n.subject === currentSubject;
    const matchQ =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.topic.toLowerCase().includes(q) ||
      n.subject.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q));
    return matchSubj && matchQ;
  });

  if      (currentSort === 'rating')    list.sort((a, b) => b.stars - a.stars);
  else if (currentSort === 'downloads') list.sort((a, b) => b.downloads - a.downloads);
  else                                  list.sort((a, b) => b.date.localeCompare(a.date));

  return list;
}

function renderNotes(list) {
  const grid = document.getElementById('notes-grid');
  document.getElementById('results-count').textContent =
    `Showing ${list.length} note${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    grid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;color:var(--text3);padding:3rem">' +
      'No notes found. Be the first to upload!</div>';
    return;
  }

  grid.innerHTML = list.map(n => `
    <div class="note-card" onclick="viewNote(${n.id})">
      <div class="note-header">
        <span class="note-type ${typeClass(n.type)}">${typeLabel(n.type)}</span>
        <div class="note-actions">
          <button class="icon-btn"
            onclick="event.stopPropagation(); bookmarkNote(${n.id})"
            title="Bookmark">🔖</button>
          <button class="icon-btn"
            onclick="event.stopPropagation(); downloadNote(${n.id})"
            title="Download">⬇️</button>
        </div>
      </div>
      <div class="note-title">${n.title}</div>
      <div class="note-meta">${n.author} · ${n.university} · ${n.topic}</div>
      <div class="note-tags">${n.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="note-footer">
        <div>
          <span class="stars">${renderStars(n.stars)}</span>
          <span class="star-count">${n.stars}</span>
        </div>
        <div class="downloads">⬇ ${n.downloads.toLocaleString()}</div>
      </div>
    </div>`).join('');
}

function filterNotes() { renderNotes(getFilteredNotes()); }

function filterBySubject(el, subj) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentSubject = subj;
  filterNotes();
}

function sortNotes(val) { currentSort = val; filterNotes(); }

function searchTopic(topic) {
  document.getElementById('main-search').value = topic;
  filterNotes();
  document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

function viewNote(id)      { showToast('📄', 'Opening note viewer… (backend needed)', '#7c6ff7'); }
function bookmarkNote(id)  { showToast('🔖', 'Bookmarked! Find it in your profile.', '#fbbf24'); }
function downloadNote(id)  {
  notes.find(n => n.id === id).downloads++;
  renderNotes(getFilteredNotes());
  showToast('⬇️', 'Download started!', '#4ade80');
}

// ── ANIMATED STAT COUNTERS ───────────────────────────────────
function animateCount(id, target) {
  let cur = 0;
  const step = Math.ceil(target / 60);
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    document.getElementById(id).textContent = cur.toLocaleString();
    if (cur >= target) clearInterval(t);
  }, 20);
}

// ── LEADERBOARD ──────────────────────────────────────────────
function renderLeaderboard(list, containerId) {
  document.getElementById(containerId).innerHTML = list.map((u, i) => `
    <div class="contributor-row">
      <div class="contributor-rank ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}">
        ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
      </div>
      <div class="avatar" style="background:${u.color}22; color:${u.color}">${u.init}</div>
      <div class="contributor-info">
        <div class="contributor-name">${u.name}</div>
        <div class="contributor-sub">${u.sub}</div>
      </div>
      <div class="contributor-score">${u.score}</div>
    </div>`).join('');
}

// ── AUTH MODAL ───────────────────────────────────────────────
function openModal(type) {
  const body = document.getElementById('modal-body');

  body.innerHTML = type === 'login' ? `
    <div class="modal-title">Welcome back 👋</div>
    <div class="modal-sub">Log in to access your notes and uploads.</div>
    <button class="social-btn">🔵 Continue with Google</button>
    <div class="divider"><span>or email</span></div>
    <div class="form-group" style="margin-bottom:12px">
      <label class="form-label">Email</label>
      <input class="form-input" type="email" placeholder="you@college.edu">
    </div>
    <div class="form-group" style="margin-bottom:16px">
      <label class="form-label">Password</label>
      <input class="form-input" type="password" placeholder="••••••••">
    </div>
    <button class="btn btn-primary"
      style="width:100%;padding:12px;border-radius:10px"
      onclick="showToast('✅','Logged in successfully!','#4ade80'); closeModalDirect()">
      Log In
    </button>
    <p style="text-align:center;font-size:13px;color:var(--text3);margin-top:1rem">
      Don't have an account?
      <a href="#" style="color:var(--accent2)" onclick="openModal('signup')">Sign up</a>
    </p>
  ` : `
    <div class="modal-title">Join NoteVault 🚀</div>
    <div class="modal-sub">Create a free account and start sharing notes.</div>
    <button class="social-btn">🔵 Sign up with Google</button>
    <div class="divider"><span>or email</span></div>
    <div class="form-group" style="margin-bottom:12px">
      <label class="form-label">Full Name</label>
      <input class="form-input" type="text" placeholder="Your name">
    </div>
    <div class="form-group" style="margin-bottom:12px">
      <label class="form-label">Email</label>
      <input class="form-input" type="email" placeholder="you@college.edu">
    </div>
    <div class="form-group" style="margin-bottom:16px">
      <label class="form-label">Password</label>
      <input class="form-input" type="password" placeholder="Create a password">
    </div>
    <button class="btn btn-primary"
      style="width:100%;padding:12px;border-radius:10px"
      onclick="showToast('🎉','Account created! Welcome to NoteVault!','#4ade80'); closeModalDirect()">
      Create Account
    </button>
    <p style="text-align:center;font-size:13px;color:var(--text3);margin-top:1rem">
      Already have an account?
      <a href="#" style="color:var(--accent2)" onclick="openModal('login')">Log in</a>
    </p>
  `;

  document.getElementById('auth-modal').classList.add('open');
}

function closeModal(e) {
  if (e.target.id === 'auth-modal')
    document.getElementById('auth-modal').classList.remove('open');
}
function closeModalDirect() {
  document.getElementById('auth-modal').classList.remove('open');
}

// ── DRAG & DROP UPLOAD ───────────────────────────────────────
function dragOver(e)  { e.preventDefault(); document.getElementById('drop-zone').classList.add('dragover'); }
function dragLeave()  { document.getElementById('drop-zone').classList.remove('dragover'); }
function dropFile(e)  { e.preventDefault(); dragLeave(); handleFiles(e.dataTransfer.files); }

function handleFiles(files) {
  if (!files.length) return;
  const names = Array.from(files).map(f => f.name).join(', ');
  document.getElementById('upload-icon').textContent = '✅';
  document.getElementById('upload-text').textContent  = `Ready: ${names}`;
  showToast('📎', `${files.length} file(s) selected`, '#2dd4bf');
}

// ── DARK / LIGHT TOGGLE ──────────────────────────────────────
function toggleDark() {
  isDark = !isDark;
  const root = document.documentElement;

  if (!isDark) {
    root.style.setProperty('--bg',      '#f8f7ff');
    root.style.setProperty('--surface', '#ffffff');
    root.style.setProperty('--surface2','#f0effe');
    root.style.setProperty('--surface3','#e4e1fd');
    root.style.setProperty('--text',    '#1a1830');
    root.style.setProperty('--text2',   '#4a4780');
    root.style.setProperty('--text3',   '#8b88b0');
    root.style.setProperty('--border',  'rgba(124,111,247,0.12)');
    root.style.setProperty('--glow',    'rgba(124,111,247,0.06)');
    document.querySelector('.dark-toggle').textContent = '🌙 Dark';
  } else {
    root.style.setProperty('--bg',      '#0a0a0f');
    root.style.setProperty('--surface', '#12121a');
    root.style.setProperty('--surface2','#1a1a26');
    root.style.setProperty('--surface3','#22223a');
    root.style.setProperty('--text',    '#f0effe');
    root.style.setProperty('--text2',   '#a09fc0');
    root.style.setProperty('--text3',   '#6b6a8a');
    root.style.setProperty('--border',  'rgba(124,111,247,0.15)');
    root.style.setProperty('--glow',    'rgba(124,111,247,0.12)');
    document.querySelector('.dark-toggle').textContent = '☀️ Light';
  }
}

// ── TOAST NOTIFICATION ───────────────────────────────────────
function showToast(emoji, msg, color) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent    = `${emoji} ${msg}`;
  document.getElementById('toast-dot').style.background = color;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── SCROLL REVEAL ────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── INIT ─────────────────────────────────────────────────────
renderNotes(getFilteredNotes());
renderLeaderboard(uploaders, 'uploaders-list');
renderLeaderboard(helpful,   'helpful-list');
setTimeout(() => {
  animateCount('s1', 14320);
  animateCount('s2', 8943);
  animateCount('s3', 84);
  animateCount('s4', 52000);
}, 400);