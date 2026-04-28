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
        const cJson = await cR.json(), pJson = await pR.json();
        const cs = cJson.results || cJson, ps = pJson.results || pJson;
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

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('admin.html')) {
        const user = getAuthUser();
        if (!user || !user.is_staff) window.location.href = '../home/index.html';
    }
});
