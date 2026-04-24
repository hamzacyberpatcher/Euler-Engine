const API_URL = 'http://localhost:8000/api';

// DOM Elements - Auth
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMessage = document.getElementById('login-message');
const registerMessage = document.getElementById('register-message');
const loginBtn = document.getElementById('login-btn');
const regBtn = document.getElementById('reg-btn');
const authNavLinks = document.getElementById('auth-nav-links');

// DOM Elements - Home
const contestsList = document.getElementById('contests-list');

// DOM Elements - Admin
const adminContestForm = document.getElementById('admin-contest-form');
const adminProblemForm = document.getElementById('admin-problem-form');
const adminAssignForm = document.getElementById('admin-assign-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const assignContestSelect = document.getElementById('assign-contest');
const assignProblemSelect = document.getElementById('assign-problem');

// DOM Elements - Registration & Arena
const confirmRegBtn = document.getElementById('confirm-reg-btn');
const regContestTitle = document.getElementById('reg-contest-title');
const regContestId = document.getElementById('reg-contest-id');
const regStatusMsg = document.getElementById('registration-status-message');
const arenaProblemsList = document.getElementById('arena-problems-list');
const arenaSubmissionsList = document.getElementById('arena-submissions-list');
const arenaLeaderboardList = document.getElementById('arena-leaderboard-list');
const arenaContestTitle = document.getElementById('arena-contest-title');
const arenaMainContent = document.getElementById('arena-main-content');
const arenaCountdownContainer = document.getElementById('arena-countdown-container');
const bigCountdownTimer = document.getElementById('big-countdown-timer');
const countdownContestTitle = document.getElementById('countdown-contest-title');

// DOM Elements - Problem Solver
const probTitle = document.getElementById('prob-title');
const probCategory = document.getElementById('prob-category');
const probRating = document.getElementById('prob-rating');
const probStatement = document.getElementById('prob-statement');
const solutionText = document.getElementById('solution-text');
const submitProbBtn = document.getElementById('submit-prob-btn');
const submissionMsg = document.getElementById('submission-msg');

// Utility Functions
function showMessage(element, message, isError = true) {
    if (!element) return;
    element.textContent = message;
    element.className = `message ${isError ? 'error' : 'success'}`;
}

function setLoading(btn, isLoading) {
    if (!btn) return;
    if (isLoading) { btn.classList.add('loading'); btn.disabled = true; }
    else { btn.classList.remove('loading'); btn.disabled = false; }
}

function getAuthUser() {
    const t = localStorage.getItem('euler_token'), u = localStorage.getItem('euler_user');
    if (t && u) try { return JSON.parse(u); } catch (e) { return null; }
    return null;
}

function getAuthToken() { return localStorage.getItem('euler_token'); }

function logout() { localStorage.removeItem('euler_token'); localStorage.removeItem('euler_user'); window.location.href = 'index.html'; }

function updateNavigation() {
    if (!authNavLinks) return;
    const user = getAuthUser();
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    const isAdmin = window.location.pathname.endsWith('admin.html');
    let h = '';
    if (user) {
        if (!isHome) h += `<a href="index.html" class="nav-link">Home</a>`;
        if (user.is_staff && !isAdmin) h += `<a href="admin.html" class="nav-link">Admin Panel</a>`;
        authNavLinks.innerHTML = `${h} <span class="nav-link" style="color: #a0a0a0; cursor: default;">Welcome, ${user.username}</span> <a href="#" class="nav-link btn-nav btn-outline" id="logout-btn" style="background: transparent; border: 1px solid #23a2f6; color: #23a2f6 !important;">Logout</a>`;
        const lb = document.getElementById('logout-btn');
        if (lb) lb.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    } else {
        if (!isHome) h += `<a href="index.html" class="nav-link">Home</a>`;
        authNavLinks.innerHTML = `${h} <a href="login.html" class="nav-link">Login</a> <a href="register.html" class="nav-link btn-nav">Sign Up</a>`;
    }
}

async function fetchContests() {
    if (!contestsList) return;
    const user = getAuthUser();
    try {
        const [cR, rR] = await Promise.all([
            fetch(`${API_URL}/contests/`),
            user ? fetch(`${API_URL}/contest-registrations/?user=${user.id}`, { headers: { 'Authorization': `Token ${getAuthToken()}` } }) : Promise.resolve({ ok: true, json: () => ({ results: [] }) })
        ]);
        const cD = await cR.json(), rD = await rR.json();
        const cs = cD.results || cD, rIds = (rD.results || rD).map(r => r.contest);
        contestsList.innerHTML = '';
        if (cs.length === 0) { contestsList.innerHTML = '<div class="no-contests">No active contests found.</div>'; return; }
        cs.forEach(c => {
            const isR = rIds.includes(c.contest_id);
            const card = document.createElement('div');
            card.className = 'contest-card'; card.style.cursor = 'pointer';
            card.onclick = () => window.location.href = isR ? `contest.html?contest_id=${c.contest_id}` : `registration.html?contest_id=${c.contest_id}`;
            card.innerHTML = `<div class="contest-info"><div class="contest-title">${c.title} ${isR ? '<span class="tag" style="background:rgba(76,209,55,0.1); color:#4cd137; margin-left:10px;">Registered</span>' : ''}</div><div class="contest-desc">ID: ${c.contest_id}</div></div><div class="contest-meta-container"><div class="contest-meta"><div><span style="color:#23a2f6;">Starts:</span> ${new Date(c.start_time).toLocaleString()}</div></div><div class="contest-meta"><div><span style="color:#ff512f;">Ends:</span> ${new Date(c.end_time).toLocaleString()}</div></div></div>`;
            contestsList.appendChild(card);
        });
    } catch (e) { console.error(e); }
}

async function initRegistrationPage() {
    if (!confirmRegBtn) return;
    const p = new URLSearchParams(window.location.search), cId = p.get('contest_id'), user = getAuthUser();
    if (!user || !cId) { window.location.href = 'index.html'; return; }
    try {
        const [cR, rR] = await Promise.all([
            fetch(`${API_URL}/contests/${cId}/`),
            fetch(`${API_URL}/contest-registrations/?contest=${cId}&user=${user.id}`, { headers: { 'Authorization': `Token ${getAuthToken()}` } })
        ]);
        const c = await cR.json(), rs = await rR.json();
        regContestTitle.textContent = c.title; regContestId.textContent = `ID: ${c.contest_id}`;
        if ((rs.results || rs).length > 0) { showMessage(regStatusMsg, 'Redirecting...', false); setTimeout(() => window.location.href = `contest.html?contest_id=${cId}`, 1500); confirmRegBtn.disabled = true; }
    } catch (e) { showMessage(regStatusMsg, e.message); }
    confirmRegBtn.onclick = async () => {
        setLoading(confirmRegBtn, true);
        try {
            const res = await fetch(`${API_URL}/contest-registrations/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${getAuthToken()}` }, body: JSON.stringify({ contest: cId, user: user.id }) });
            if (res.ok) { showMessage(regStatusMsg, 'Success!', false); setTimeout(() => window.location.href = 'index.html', 1500); }
        } catch (e) { showMessage(regStatusMsg, e.message); } finally { setLoading(confirmRegBtn, false); }
    };
}

async function initArenaPage() {
    if (!arenaProblemsList) return;
    const p = new URLSearchParams(window.location.search), cId = p.get('contest_id'), user = getAuthUser();
    if (!user || !cId) { window.location.href = 'index.html'; return; }
    try {
        const [rR, cR] = await Promise.all([
            fetch(`${API_URL}/contest-registrations/?contest=${cId}&user=${user.id}`, { headers: { 'Authorization': `Token ${getAuthToken()}` } }),
            fetch(`${API_URL}/contests/${cId}/`)
        ]);
        const rs = await rR.json(); if ((rs.results || rs).length === 0) { window.location.href = `registration.html?contest_id=${cId}`; return; }
        const c = await cR.json(), sT = new Date(c.start_time);
        if (new Date() < sT) {
            arenaMainContent.style.display = 'none'; arenaCountdownContainer.style.display = 'flex'; countdownContestTitle.textContent = c.title;
            const tI = setInterval(() => {
                const diff = sT - new Date(); if (diff <= 0) { clearInterval(tI); window.location.reload(); return; }
                const ds = Math.floor(diff / 864e5), hs = Math.floor((diff / 36e5) % 24), ms = Math.floor((diff / 6e4) % 60), ss = Math.floor((diff / 1e3) % 60);
                bigCountdownTimer.textContent = `${ds.toString().padStart(2, '0')}:${hs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
            }, 1000); return;
        }
        arenaContestTitle.textContent = c.title;
        const pR = await fetch(`${API_URL}/contest-problems/?contest=${cId}`);
        const ps = (await pR.json()).results || (await pR.json());
        arenaProblemsList.innerHTML = '';
        if (ps.length === 0) arenaProblemsList.innerHTML = '<div>No problems assigned.</div>';
        else {
            const ds = await Promise.all(ps.map(cp => fetch(`${API_URL}/problems/${cp.problem}/`).then(r => r.json())));
            ps.forEach((cp, i) => {
                const p = ds[i], card = document.createElement('div'); card.className = 'contest-card'; card.style.cursor = 'pointer';
                card.onclick = () => window.location.href = `problem.html?problem_id=${p.problem_id}&contest_id=${cId}`;
                card.innerHTML = `<div class="contest-info"><div class="contest-title">${p.title}</div><div class="contest-desc">${p.category} | ${p.rating} pts</div></div><div class="contest-meta-container"><div class="contest-meta"><span style="color:#23a2f6; font-weight:600;">Worth ${cp.point_value} Points</span></div></div>`;
                arenaProblemsList.appendChild(card);
            });
        }
        tabBtns.forEach(b => b.addEventListener('click', () => {
            const t = b.getAttribute('data-tab');
            if (t === 'arena-submissions-tab') fetchMySubmissions(cId, user.id);
            if (t === 'arena-leaderboard-tab') fetchLeaderboard(cId);
        }));
    } catch (e) { console.error(e); }
}

async function fetchLeaderboard(cId) {
    if (!arenaLeaderboardList) return;
    try {
        const [pRes, sRes, rRes] = await Promise.all([fetch(`${API_URL}/contest-problems/?contest=${cId}`), fetch(`${API_URL}/submissions/?contest=${cId}`), fetch(`${API_URL}/contest-registrations/?contest=${cId}`, { headers: { 'Authorization': `Token ${getAuthToken()}` } })]);
        const pD = await pRes.json(), sD = await sRes.json(), rD = await rRes.json();
        const cp = pD.results || pD, sub = sD.results || sD, regs = rD.results || rD;
        const det = await Promise.all(cp.map(x => fetch(`${API_URL}/problems/${x.problem}/`).then(r => r.json())));
        const uS = {};
        regs.forEach(r => { uS[r.user] = { username: r.user_username || `User ${r.user}`, problems: {}, total: 0 }; cp.forEach(x => uS[r.user].problems[x.problem] = 0); });
        sub.forEach(s => { if (uS[s.user] && s.grading_status === 'Graded') uS[s.user].problems[s.problem] = Math.max(uS[s.user].problems[s.problem], s.score || 0); });
        const lb = Object.values(uS).map(u => { u.total = Object.values(u.problems).reduce((a, b) => a + b, 0); return u; }).sort((a, b) => b.total - a.total);
        let h = `<table class="leaderboard-table"><thead><tr><th>Rank</th><th>User</th>`;
        det.forEach(d => h += `<th>${d.title}</th>`); h += `<th>Total</th></tr></thead><tbody>`;
        lb.forEach((u, i) => { h += `<tr><td class="rank-cell">#${i + 1}</td><td>${u.username}</td>`; cp.forEach(x => { const s = u.problems[x.problem]; h += `<td class="score-cell ${s === 0 ? 'zero' : ''}">${s}</td>`; }); h += `<td class="score-cell">${u.total}</td></tr>`; });
        arenaLeaderboardList.innerHTML = h + `</tbody></table>`;
    } catch (e) { console.error(e); }
}

async function fetchMySubmissions(cId, uId) {
    if (!arenaSubmissionsList) return;
    try {
        const r = await fetch(`${API_URL}/submissions/?contest=${cId}&user=${uId}`, { headers: { 'Authorization': `Token ${getAuthToken()}` } });
        const d = await r.json(), ss = d.results || d;
        arenaSubmissionsList.innerHTML = '';
        if (ss.length === 0) { arenaSubmissionsList.innerHTML = '<div>No submissions yet.</div>'; return; }
        const pIds = [...new Set(ss.map(s => s.problem))], pD = {};
        await Promise.all(pIds.map(id => fetch(`${API_URL}/problems/${id}/`).then(r => r.json()).then(p => pD[id] = p.title)));
        ss.forEach(s => {
            const card = document.createElement('div'); card.className = 'contest-card';
            card.innerHTML = `<div class="contest-info"><div class="contest-title">${pD[s.problem] || s.problem}</div><div class="contest-desc">Submitted: ${new Date(s.submitted_at).toLocaleString()}</div></div><div class="contest-meta-container"><div class="contest-meta"><span class="tag" style="background: ${s.grading_status === 'Graded' ? 'rgba(76,209,55,0.1)' : 'rgba(255,165,0,0.1)'}; color: ${s.grading_status === 'Graded' ? '#4cd137' : '#ffa500'};">${s.grading_status}</span>${s.grading_status === 'Graded' ? `<span style="margin-left:15px; font-weight:600; color:#fff;">Score: ${s.score}</span>` : ''}</div></div>`;
            arenaSubmissionsList.appendChild(card);
        });
    } catch (e) { console.error(e); }
}

async function initProblemPage() {
    if (!submitProbBtn) return;
    const p = new URLSearchParams(window.location.search), pId = p.get('problem_id'), cId = p.get('contest_id'), user = getAuthUser();
    if (!user || !pId || !cId) { window.location.href = 'index.html'; return; }
    try {
        const r = await fetch(`${API_URL}/problems/${pId}/`), pD = await r.json();
        probTitle.textContent = pD.title; probCategory.textContent = pD.category; probRating.textContent = `${pD.rating} Points`; probStatement.textContent = pD.statement;
    } catch (e) { console.error(e); }
    submitProbBtn.onclick = async () => {
        const t = solutionText.value.trim(); if (!t) return;
        setLoading(submitProbBtn, true);
        try {
            const res = await fetch(`${API_URL}/submissions/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${getAuthToken()}` }, body: JSON.stringify({ contest: cId, problem: pId, user: user.id, answer_text: t }) });
            if (res.ok) { showMessage(submissionMsg, 'Success!', false); solutionText.value = ''; setTimeout(() => window.location.href = `contest.html?contest_id=${cId}`, 1500); }
        } catch (e) { console.error(e); } finally { setLoading(submitProbBtn, false); }
    };
}

// Admin Panel
if (tabBtns.length > 0) {
    tabBtns.forEach(b => b.addEventListener('click', () => {
        tabBtns.forEach(x => x.classList.remove('active')); b.classList.add('active');
        tabContents.forEach(c => c.classList.remove('active'));
        const tId = b.getAttribute('data-tab'); document.getElementById(tId).classList.add('active');
        if (tId === 'assign-tab') fetchAdminData();
    }));
}

async function fetchAdminData() {
    try {
        const [cR, pR] = await Promise.all([fetch(`${API_URL}/contests/`), fetch(`${API_URL}/problems/`)]);
        const cs = (await cR.json()).results || (await cR.json()), ps = (await pR.json()).results || (await pR.json());
        if (assignContestSelect) { assignContestSelect.innerHTML = '<option value="" disabled selected>Select Contest</option>'; cs.forEach(c => assignContestSelect.innerHTML += `<option value="${c.contest_id}">${c.title}</option>`); }
        if (assignProblemSelect) { assignProblemSelect.innerHTML = '<option value="" disabled selected>Select Problem</option>'; ps.forEach(p => assignProblemSelect.innerHTML += `<option value="${p.problem_id}">${p.title}</option>`); }
    } catch (e) { console.error(e); }
}

if (adminContestForm) {
    adminContestForm.addEventListener('submit', async (e) => {
        e.preventDefault(); const m = document.getElementById('admin-contest-message'), b = document.getElementById('create-contest-btn');
        const p = { contest_id: document.getElementById('contest-id').value, title: document.getElementById('contest-title').value, start_time: document.getElementById('contest-start').value, end_time: document.getElementById('contest-end').value, is_active: true };
        setLoading(b, true);
        try {
            const r = await fetch(`${API_URL}/contests/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${getAuthToken()}` }, body: JSON.stringify(p) });
            if (r.ok) { showMessage(m, 'Success!', false); adminContestForm.reset(); }
        } catch (err) { console.error(err); } finally { setLoading(b, false); }
    });
}

if (adminProblemForm) {
    adminProblemForm.addEventListener('submit', async (e) => {
        e.preventDefault(); const m = document.getElementById('admin-problem-message'), b = document.getElementById('create-problem-btn');
        const p = {
            problem_id: document.getElementById('problem-id').value,
            title: document.getElementById('problem-title').value,
            statement: document.getElementById('problem-statement').value,
            category: document.getElementById('problem-category').value,
            rating: parseInt(document.getElementById('problem-rating').value),
            reference_solution: document.getElementById('problem-solution').value,
            max_points: parseInt(document.getElementById('problem-rating').value) // Default to rating for now
        };
        setLoading(b, true);
        try {
            const r = await fetch(`${API_URL}/problems/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${getAuthToken()}` }, body: JSON.stringify(p) });
            if (r.ok) { showMessage(m, 'Problem Created!', false); adminProblemForm.reset(); }
        } catch (err) { console.error(err); } finally { setLoading(b, false); }
    });
}

if (adminAssignForm) {
    adminAssignForm.addEventListener('submit', async (e) => {
        e.preventDefault(); const m = document.getElementById('admin-assign-message'), b = document.getElementById('assign-btn');
        const p = { contest: document.getElementById('assign-contest').value, problem: document.getElementById('assign-problem').value, point_value: parseInt(document.getElementById('assign-points').value) };
        setLoading(b, true);
        try {
            const r = await fetch(`${API_URL}/contest-problems/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${getAuthToken()}` }, body: JSON.stringify(p) });
            if (r.ok) { showMessage(m, 'Assigned!', false); adminAssignForm.reset(); }
        } catch (err) { console.error(err); } finally { setLoading(b, false); }
    });
}

// Auth
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); const b = document.getElementById('reg-btn'), p = { username: document.getElementById('reg-username').value, email: document.getElementById('reg-email').value, password: document.getElementById('reg-password').value };
        setLoading(b, true);
        try {
            const r = await fetch(`${API_URL}/register/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
            if (r.ok) { showMessage(registerMessage, 'Success!', false); setTimeout(() => window.location.href = 'login.html', 1500); }
        } catch (err) { console.error(err); } finally { setLoading(b, false); }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); const u = document.getElementById('login-username').value, p = document.getElementById('login-password').value;
        setLoading(loginBtn, true); const pay = u.includes('@') ? { email: u, password: p } : { username: u, password: p };
        try {
            const r = await fetch(`${API_URL}/login/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pay) });
            const d = await r.json(); if (r.ok) {
                localStorage.setItem('euler_token', d.token); localStorage.setItem('euler_user', JSON.stringify({ id: d.user_id, username: d.username, email: d.email, is_staff: d.is_staff }));
                window.location.href = 'index.html';
            }
        } catch (err) { console.error(err); } finally { setLoading(loginBtn, false); }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('admin.html')) { const user = getAuthUser(); if (!user || !user.is_staff) window.location.href = 'index.html'; }
    updateNavigation(); if (contestsList) fetchContests(); if (confirmRegBtn) initRegistrationPage(); if (arenaProblemsList) initArenaPage(); if (submitProbBtn) initProblemPage();
});
