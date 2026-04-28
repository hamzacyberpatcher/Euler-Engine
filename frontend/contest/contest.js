async function initArenaPage() {
    if (!arenaProblemsList) return;
    const p = new URLSearchParams(window.location.search), cId = p.get('contest_id'), user = getAuthUser();
    if (!user || !cId) { window.location.href = '../home/index.html'; return; }
    try {
        const [rR, cR] = await Promise.all([
            fetch(`${API_URL}/contest-registrations/?contest=${cId}&user=${user.id}`, { headers: { 'Authorization': `Token ${getAuthToken()}` } }),
            fetch(`${API_URL}/contests/${cId}/`)
        ]);
        const rs = await rR.json(); if ((rs.results || rs).length === 0) { window.location.href = `../registration/registration.html?contest_id=${cId}`; return; }
        const c = await cR.json(), sT = new Date(c.start_time), eT = new Date(c.end_time);
        const now = new Date();
        if (now < sT) {
            arenaMainContent.style.display = 'none'; arenaCountdownContainer.style.display = 'flex'; countdownContestTitle.textContent = c.title;
            const tI = setInterval(() => {
                const diff = sT - new Date(); if (diff <= 0) { clearInterval(tI); window.location.reload(); return; }
                const ds = Math.floor(diff / 864e5), hs = Math.floor((diff / 36e5) % 24), ms = Math.floor((diff / 6e4) % 60), ss = Math.floor((diff / 1e3) % 60);
                bigCountdownTimer.textContent = `${ds.toString().padStart(2, '0')}:${hs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
            }, 1000);
            return;
        }

        const isEnded = now > eT;
        arenaContestTitle.innerHTML = c.title + (isEnded ? ' <span style="color: #ff512f; font-size: 18px; vertical-align: middle; margin-left: 15px;">[ENDED]</span>' : '');
        const timerMsg = document.getElementById('arena-contest-timer');
        if (timerMsg) timerMsg.textContent = isEnded ? 'Contest has ended. Submissions are closed.' : 'Contest is active';
        const pR = await fetch(`${API_URL}/contest-problems/?contest=${cId}`);
        const pJson = await pR.json();
        const ps = pJson.results || pJson;
        arenaProblemsList.innerHTML = '';
        if (ps.length === 0) arenaProblemsList.innerHTML = '<div>No problems assigned.</div>';
        else {
            const ds = await Promise.all(ps.map(cp => fetch(`${API_URL}/problems/${cp.problem}/`).then(r => r.json())));
            ps.forEach((cp, i) => {
                const p = ds[i], card = document.createElement('div'); card.className = 'contest-card'; card.style.cursor = 'pointer';
                card.onclick = () => window.location.href = `../problem/problem.html?problem_id=${p.problem_id}&contest_id=${cId}`;
                card.innerHTML = `<div class="contest-info"><div class="contest-title">${p.title}</div><div class="contest-desc">${p.category} | ${p.rating} pts</div></div><div class="contest-meta-container"><div class="contest-meta"><span style="color:#23a2f6; font-weight:600;">Worth ${cp.point_value} Points</span></div></div>`;
                arenaProblemsList.appendChild(card);
            });
        }
        tabBtns.forEach(b => b.addEventListener('click', () => {
            tabBtns.forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            tabContents.forEach(c => c.classList.remove('active'));
            const t = b.getAttribute('data-tab');
            const targetContent = document.getElementById(t);
            if (targetContent) targetContent.classList.add('active');

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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('arena-problems-list')) initArenaPage();
});
