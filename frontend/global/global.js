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

function logout() { localStorage.removeItem('euler_token'); localStorage.removeItem('euler_user'); window.location.href = '../home/index.html'; }

function updateNavigation() {
    if (!authNavLinks) return;
    const user = getAuthUser();
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    const isAdmin = window.location.pathname.endsWith('admin.html');
    let h = '';
    if (user) {
        if (!isHome) h += `<a href="../home/index.html" class="nav-link">Home</a>`;
        if (user.is_staff && !isAdmin) h += `<a href="../admin/admin.html" class="nav-link">Admin Panel</a>`;
        authNavLinks.innerHTML = `${h} <span class="nav-link" style="color: #a0a0a0; cursor: default;">Welcome, ${user.username}</span> <a href="#" class="nav-link btn-nav btn-outline" id="logout-btn" style="background: transparent; border: 1px solid #23a2f6; color: #23a2f6 !important;">Logout</a>`;
        const lb = document.getElementById('logout-btn');
        if (lb) lb.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    } else {
        if (!isHome) h += `<a href="../home/index.html" class="nav-link">Home</a>`;
        authNavLinks.innerHTML = `${h} <a href="../auth/login.html" class="nav-link">Login</a> <a href="../auth/register.html" class="nav-link btn-nav">Sign Up</a>`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});
