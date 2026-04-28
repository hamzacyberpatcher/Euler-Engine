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

        const now = new Date();
        const activeContests = cs.filter(c => new Date(c.end_time) >= now);
        const pastContests = cs.filter(c => new Date(c.end_time) < now);

        const renderContest = (c) => {
            const isR = rIds.includes(c.contest_id);
            const card = document.createElement('div');
            card.className = 'contest-card'; card.style.cursor = 'pointer';
            card.onclick = () => window.location.href = isR ? `../contest/contest.html?contest_id=${c.contest_id}` : `../registration/registration.html?contest_id=${c.contest_id}`;
            card.innerHTML = `<div class="contest-info"><div class="contest-title">${c.title} ${isR ? '<span class="tag" style="background:rgba(76,209,55,0.1); color:#4cd137; margin-left:10px;">Registered</span>' : ''}</div><div class="contest-desc">ID: ${c.contest_id}</div></div><div class="contest-meta-container"><div class="contest-meta"><div><span style="color:#23a2f6;">Starts:</span> ${new Date(c.start_time).toLocaleString()}</div></div><div class="contest-meta"><div><span style="color:#ff512f;">Ends:</span> ${new Date(c.end_time).toLocaleString()}</div></div></div>`;
            contestsList.appendChild(card);
        };

        if (activeContests.length > 0) {
            activeContests.forEach(renderContest);
        } else {
            contestsList.innerHTML += '<div class="no-contests">No active or upcoming contests.</div>';
        }

        if (pastContests.length > 0) {
            const separator = document.createElement('div');
            separator.style.cssText = 'width: 100%; height: 1px; background: rgba(255, 255, 255, 0.1); margin: 30px 0 10px;';
            contestsList.appendChild(separator);

            const pastHeader = document.createElement('h3');
            pastHeader.textContent = 'Past Contests';
            pastHeader.style.cssText = 'color: #a0a0a0; margin-bottom: 10px; font-weight: 400; font-size: 20px;';
            contestsList.appendChild(pastHeader);

            pastContests.forEach(renderContest);
        }
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('contests-list')) fetchContests();
});
