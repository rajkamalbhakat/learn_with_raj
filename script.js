// ============================================================
//  Learn with Raj — script.js
//  Firebase: Auth + Firestore  |  Supabase: File Storage
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ── FIREBASE CONFIG ──────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyD-4w7oCyJHn0n3E_SH2VPqTaIn93rqQ18",
  authDomain: "learnwithraj-e1406.firebaseapp.com",
  projectId: "learnwithraj-e1406",
  messagingSenderId: "1012081771442",
  appId: "1:1012081771442:web:bfe4c85ce8e4114b2d9aab"
};

// ── SUPABASE CONFIG ──────────────────────────────────────────
const SUPABASE_URL = "https://tpwfcwkjyztajcakyqlz.supabase.co";
const SUPABASE_KEY = "sb_publishable_a4tdjkDcLtNsg33b6nKOEQ_d4huU-9k";

// ── INIT ─────────────────────────────────────────────────────
const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const provider = new GoogleAuthProvider();
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── STATE ─────────────────────────────────────────────────────
let currentUser    = null;
let allNotes       = [];
let selectedFile   = null;
let currentSubject = '';
let currentSort    = 'newest';
let isDark         = true;

// ── AUTH STATE ────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('user-info').style.display    = 'flex';
    document.getElementById('user-name').textContent      = `👋 ${user.displayName || user.email}`;
    document.getElementById('upload-login-warn').style.display = 'none';
    document.getElementById('upload-form').style.display        = 'block';
  } else {
    document.getElementById('auth-buttons').style.display = 'flex';
    document.getElementById('user-info').style.display    = 'none';
    document.getElementById('upload-login-warn').style.display = 'block';
    document.getElementById('upload-form').style.display        = 'none';
  }
});

// ── AUTH MODAL ────────────────────────────────────────────────
window.openModal = function(type) {
  const body = document.getElementById('modal-body');
  body.innerHTML = type === 'login' ? `
    <div class="modal-title">Welcome back 👋</div>
    <div class="modal-sub">Log in to upload and rate notes.</div>
    <button class="social-btn" onclick="loginGoogle()">🔵 Continue with Google</button>
    <div class="divider"><span>or email</span></div>
    <div class="form-group" style="margin-bottom:12px">
      <label class="form-label">Email</label>
      <input class="form-input" id="login-email" type="email" placeholder="you@college.edu">
    </div>
    <div class="form-group" style="margin-bottom:16px">
      <label class="form-label">Password</label>
      <input class="form-input" id="login-pass" type="password" placeholder="••••••••">
    </div>
    <button class="btn btn-primary" style="width:100%;padding:12px;border-radius:10px" onclick="loginEmail()">Log In</button>
    <p id="auth-error" style="color:#fb7185;font-size:13px;margin-top:8px;text-align:center"></p>
    <p style="text-align:center;font-size:13px;color:var(--text3);margin-top:1rem">
      No account? <a href="#" style="color:var(--accent2)" onclick="openModal('signup')">Sign up free</a>
    </p>
  ` : `
    <div class="modal-title">Join Learn with Raj 🚀</div>
    <div class="modal-sub">Free account — upload and find notes instantly.</div>
    <button class="social-btn" onclick="loginGoogle()">🔵 Sign up with Google</button>
    <div class="divider"><span>or email</span></div>
    <div class="form-group" style="margin-bottom:12px">
      <label class="form-label">Full Name</label>
      <input class="form-input" id="signup-name" type="text" placeholder="Your name">
    </div>
    <div class="form-group" style="margin-bottom:12px">
      <label class="form-label">Email</label>
      <input class="form-input" id="signup-email" type="email" placeholder="you@college.edu">
    </div>
    <div class="form-group" style="margin-bottom:16px">
      <label class="form-label">Password</label>
      <input class="form-input" id="signup-pass" type="password" placeholder="Create a password">
    </div>
    <button class="btn btn-primary" style="width:100%;padding:12px;border-radius:10px" onclick="signupEmail()">Create Account</button>
    <p id="auth-error" style="color:#fb7185;font-size:13px;margin-top:8px;text-align:center"></p>
    <p style="text-align:center;font-size:13px;color:var(--text3);margin-top:1rem">
      Have an account? <a href="#" style="color:var(--accent2)" onclick="openModal('login')">Log in</a>
    </p>
  `;
  document.getElementById('auth-modal').classList.add('open');
};

window.loginEmail = async function() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeModalDirect();
    showToast('✅', 'Logged in successfully!', '#4ade80');
  } catch(e) {
    document.getElementById('auth-error').textContent = e.message;
  }
};

window.signupEmail = async function() {
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass  = document.getElementById('signup-pass').value;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    closeModalDirect();
    showToast('🎉', `Welcome, ${name}!`, '#4ade80');
  } catch(e) {
    document.getElementById('auth-error').textContent = e.message;
  }
};

window.loginGoogle = async function() {
  try {
    await signInWithPopup(auth, provider);
    closeModalDirect();
    showToast('✅', 'Logged in with Google!', '#4ade80');
  } catch(e) {
    document.getElementById('auth-error').textContent = e.message;
  }
};

window.logoutUser = async function() {
  await signOut(auth);
  showToast('👋', 'Logged out.', '#a09fc0');
};

// ── FILE HANDLING ─────────────────────────────────────────────
window.dragOver  = e => { e.preventDefault(); document.getElementById('drop-zone').classList.add('dragover'); };
window.dragLeave = ()  => document.getElementById('drop-zone').classList.remove('dragover');
window.dropFile  = e  => { e.preventDefault(); window.dragLeave(); handleFiles(e.dataTransfer.files); };

window.handleFiles = function(files) {
  if (!files.length) return;
  selectedFile = files[0];
  document.getElementById('upload-icon').textContent = '✅';
  document.getElementById('upload-text').textContent  = `Selected: ${selectedFile.name}`;
  showToast('📎', `${selectedFile.name} ready`, '#2dd4bf');
};

// ── UPLOAD NOTE ───────────────────────────────────────────────
window.uploadNote = async function() {
  if (!currentUser) { openModal('signup'); return; }
  if (!selectedFile) { showToast('⚠️', 'Please select a file', '#fbbf24'); return; }

  const title   = document.getElementById('note-title').value.trim();
  const subject = document.getElementById('note-subject').value;
  const topic   = document.getElementById('note-topic').value.trim();
  const uni     = document.getElementById('note-university').value.trim();
  const sem     = document.getElementById('note-semester').value;
  const desc    = document.getElementById('note-desc').value.trim();
  const tagsRaw = document.getElementById('note-tags').value.trim();
  const tags    = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (!title)   { showToast('⚠️', 'Please enter a title', '#fbbf24'); return; }
  if (!subject) { showToast('⚠️', 'Please select a subject', '#fbbf24'); return; }
  if (!topic)   { showToast('⚠️', 'Please enter a topic', '#fbbf24'); return; }

  const btn = document.getElementById('publish-btn');
  btn.textContent = 'Uploading...';
  btn.disabled = true;

  try {
    // Upload file to Supabase Storage
    const filePath = `notes/${Date.now()}_${selectedFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('notes')
      .upload(filePath, selectedFile);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage.from('notes').getPublicUrl(filePath);
    const fileURL  = data.publicUrl;

    // Determine file type
    const ext  = selectedFile.name.split('.').pop().toLowerCase();
    const type = ext === 'pdf' ? 'pdf' : ['png','jpg','jpeg','gif'].includes(ext) ? 'img' : 'text';

    // Save metadata to Firestore
    await addDoc(collection(db, 'notes'), {
      title, subject, topic,
      university: uni,
      semester: sem,
      description: desc,
      tags,
      type,
      fileURL,
      fileName: selectedFile.name,
      author:    currentUser.displayName || currentUser.email,
      authorId:  currentUser.uid,
      stars:      0,
      ratingCount:0,
      downloads:  0,
      createdAt:  new Date()
    });

    showToast('🎉', 'Notes published! Everyone can find them now.', '#4ade80');

    // Reset form
    ['note-title','note-topic','note-university','note-desc','note-tags'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('note-subject').value  = '';
    document.getElementById('note-semester').value = '';
    document.getElementById('upload-icon').textContent = '📤';
    document.getElementById('upload-text').textContent = 'Drag & drop file here, or click to browse';
    selectedFile = null;

    loadNotes();

  } catch(err) {
    console.error(err);
    showToast('❌', 'Upload failed: ' + err.message, '#fb7185');
  }

  btn.textContent = 'Publish Notes';
  btn.disabled = false;
};

// ── LOAD NOTES ────────────────────────────────────────────────
async function loadNotes() {
  document.getElementById('loading-notes').style.display = 'block';
  document.getElementById('notes-grid').style.display    = 'none';
  document.getElementById('no-notes').style.display      = 'none';

  try {
    const snap = await getDocs(collection(db, 'notes'));
    allNotes   = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderNotes(getFilteredNotes());
    updateStats();
    loadLeaderboard();
  } catch(e) {
    console.error(e);
    document.getElementById('loading-notes').style.display = 'none';
    document.getElementById('no-notes').style.display      = 'block';
  }
}

// ── STATS ─────────────────────────────────────────────────────
function updateStats() {
  const total     = allNotes.length;
  const subjects  = new Set(allNotes.map(n => n.subject)).size;
  const downloads = allNotes.reduce((a, n) => a + (n.downloads || 0), 0);
  animateCount('s1', total);
  animateCount('s2', subjects);
  animateCount('s3', downloads);
}

// ── LEADERBOARD ───────────────────────────────────────────────
function loadLeaderboard() {
  // Top uploaders
  const uploaderMap = {};
  allNotes.forEach(n => {
    uploaderMap[n.author] = (uploaderMap[n.author] || 0) + 1;
  });
  const topUploaders = Object.entries(uploaderMap)
    .sort((a,b) => b[1]-a[1]).slice(0,4)
    .map(([name, count], i) => ({
      name, sub: `${count} upload${count!==1?'s':''}`,
      score: `${count}📤`, color: ['#7c6ff7','#2dd4bf','#fb7185','#fbbf24'][i],
      init: name.slice(0,2).toUpperCase()
    }));

  // Most downloaded
  const topNotes = [...allNotes]
    .sort((a,b) => (b.downloads||0) - (a.downloads||0)).slice(0,4)
    .map((n,i) => ({
      name: n.title, sub: `${n.subject} · ${n.downloads||0} downloads`,
      score: `${n.downloads||0}⬇`, color: ['#4ade80','#7c6ff7','#f97316','#2dd4bf'][i],
      init: '📄'
    }));

  renderLeaderboard(
    topUploaders.length ? topUploaders : [{ name:'No uploads yet', sub:'Be the first!', score:'', color:'#6b6a8a', init:'?' }],
    'uploaders-list'
  );
  renderLeaderboard(
    topNotes.length ? topNotes : [{ name:'No notes yet', sub:'Upload the first one!', score:'', color:'#6b6a8a', init:'?' }],
    'helpful-list'
  );
}

function renderLeaderboard(list, containerId) {
  document.getElementById(containerId).innerHTML = list.map((u,i) => `
    <div class="contributor-row">
      <div class="contributor-rank ${i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
      <div class="avatar" style="background:${u.color}22;color:${u.color}">${u.init}</div>
      <div class="contributor-info">
        <div class="contributor-name">${u.name}</div>
        <div class="contributor-sub">${u.sub}</div>
      </div>
      <div class="contributor-score">${u.score}</div>
    </div>`).join('');
}

// ── FILTER & SORT ─────────────────────────────────────────────
function getFilteredNotes() {
  const q = document.getElementById('main-search').value.toLowerCase().trim();
  let list = allNotes.filter(n => {
    const matchSubj = !currentSubject || n.subject === currentSubject;
    const matchQ    = !q ||
      (n.title  ||'').toLowerCase().includes(q) ||
      (n.topic  ||'').toLowerCase().includes(q) ||
      (n.subject||'').toLowerCase().includes(q) ||
      (n.tags   ||[]).some(t => t.toLowerCase().includes(q));
    return matchSubj && matchQ;
  });

  if      (currentSort === 'rating')    list.sort((a,b) => (b.stars||0) - (a.stars||0));
  else if (currentSort === 'downloads') list.sort((a,b) => (b.downloads||0) - (a.downloads||0));
  else list.sort((a,b) => {
    const da  = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
    const db2 = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
    return db2 - da;
  });
  return list;
}

function renderNotes(list) {
  document.getElementById('loading-notes').style.display = 'none';
  if (!list.length) {
    document.getElementById('notes-grid').style.display = 'none';
    document.getElementById('no-notes').style.display   = 'block';
    document.getElementById('results-count').textContent = 'No notes found';
    return;
  }
  document.getElementById('no-notes').style.display   = 'none';
  document.getElementById('notes-grid').style.display = 'grid';
  document.getElementById('results-count').textContent = `Showing ${list.length} note${list.length!==1?'s':''}`;

  document.getElementById('notes-grid').innerHTML = list.map(n => `
    <div class="note-card">
      <div class="note-header">
        <span class="note-type ${n.type==='pdf'?'type-pdf':n.type==='img'?'type-img':'type-text'}">${n.type==='pdf'?'PDF':n.type==='img'?'Image':'Text'}</span>
        <div class="note-actions">
          <button class="icon-btn" onclick="rateNote('${n.id}',event)" title="Rate">⭐</button>
          <button class="icon-btn" onclick="downloadNote('${n.id}','${n.fileURL}',event)" title="Download">⬇️</button>
        </div>
      </div>
      <div class="note-title">${n.title}</div>
      <div class="note-meta">${n.author||'Unknown'} · ${n.university||''} · ${n.topic}</div>
      ${n.tags && n.tags.length ? `<div class="note-tags">${n.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>` : ''}
      <div class="note-footer">
        <div>
          <span class="stars">${'★'.repeat(Math.round(n.stars||0))}${'☆'.repeat(5-Math.round(n.stars||0))}</span>
          <span class="star-count">${n.ratingCount ? (n.stars||0).toFixed(1) : 'No ratings'}</span>
        </div>
        <div class="downloads">⬇ ${(n.downloads||0).toLocaleString()}</div>
      </div>
    </div>`).join('');
}

window.filterNotes = function() { renderNotes(getFilteredNotes()); };

window.filterBySubject = function(el, subj) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentSubject = subj;
  filterNotes();
};

window.sortNotes = function(val) { currentSort = val; filterNotes(); };

// ── DOWNLOAD ──────────────────────────────────────────────────
window.downloadNote = async function(id, fileURL, e) {
  e.stopPropagation();
  try {
    await updateDoc(doc(db, 'notes', id), { downloads: increment(1) });
    window.open(fileURL, '_blank');
    showToast('⬇️', 'Download started!', '#4ade80');
    loadNotes();
  } catch(err) { showToast('❌', 'Download failed', '#fb7185'); }
};

// ── RATING ────────────────────────────────────────────────────
window.rateNote = async function(id, e) {
  e.stopPropagation();
  if (!currentUser) { showToast('⚠️', 'Login to rate notes', '#fbbf24'); return; }
  const rating = prompt('Rate this note (1 to 5):');
  const r = parseFloat(rating);
  if (!r || r < 1 || r > 5) { showToast('⚠️', 'Enter a number between 1 and 5', '#fbbf24'); return; }
  try {
    const note     = allNotes.find(n => n.id === id);
    const newCount = (note.ratingCount || 0) + 1;
    const newStars = ((note.stars || 0) * (note.ratingCount || 0) + r) / newCount;
    await updateDoc(doc(db, 'notes', id), { stars: newStars, ratingCount: newCount });
    showToast('⭐', `Rated ${r}/5 — thanks!`, '#fbbf24');
    loadNotes();
  } catch(err) { showToast('❌', 'Rating failed', '#fb7185'); }
};

// ── DARK MODE ─────────────────────────────────────────────────
window.toggleDark = function() {
  isDark = !isDark;
  const r = document.documentElement;
  if (!isDark) {
    r.style.setProperty('--bg','#f8f7ff'); r.style.setProperty('--surface','#ffffff');
    r.style.setProperty('--surface2','#f0effe'); r.style.setProperty('--surface3','#e4e1fd');
    r.style.setProperty('--text','#1a1830'); r.style.setProperty('--text2','#4a4780');
    r.style.setProperty('--text3','#8b88b0');
    document.querySelector('.dark-toggle').textContent = '🌙 Dark';
  } else {
    r.style.setProperty('--bg','#0a0a0f'); r.style.setProperty('--surface','#12121a');
    r.style.setProperty('--surface2','#1a1a26'); r.style.setProperty('--surface3','#22223a');
    r.style.setProperty('--text','#f0effe'); r.style.setProperty('--text2','#a09fc0');
    r.style.setProperty('--text3','#6b6a8a');
    document.querySelector('.dark-toggle').textContent = '☀️ Light';
  }
};

// ── TOAST ─────────────────────────────────────────────────────
window.showToast = function(emoji, msg, color) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent      = `${emoji} ${msg}`;
  document.getElementById('toast-dot').style.background = color;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
};

// ── MODAL ─────────────────────────────────────────────────────
window.closeModal = function(e) {
  if (e.target.id === 'auth-modal') document.getElementById('auth-modal').classList.remove('open');
};
function closeModalDirect() { document.getElementById('auth-modal').classList.remove('open'); }

// ── ANIMATE COUNTER ───────────────────────────────────────────
function animateCount(id, target) {
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 60));
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    document.getElementById(id).textContent = cur.toLocaleString();
    if (cur >= target) clearInterval(t);
  }, 20);
}

// ── SCROLL REVEAL ─────────────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ── INIT ──────────────────────────────────────────────────────
loadNotes();