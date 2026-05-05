async function initRegistrationPage() {
    const p = new URLSearchParams(window.location.search), cId = p.get('contest_id'), user = getAuthUser();
    if (!user || !cId) { window.location.href = '../home/index.html'; return; }
    try {
        const [cR, rR] = await Promise.all([
            fetch(`${API_URL}/contests/${cId}/`),
            fetch(`${API_URL}/contest-registrations/?contest=${cId}&user=${user.id}`, { headers: { 'Authorization': `Token ${getAuthToken()}` } })
        ]);

        const c = await cR.json(), rs = await rR.json();
        regContestTitle.textContent = c.title;
        regContestId.textContent = `ID: ${c.contest_id}`;

        if ((rs.results || rs).length > 0) {
            showMessage(regStatusMsg, 'Redirecting...', false);
            setTimeout(() => window.location.href = `../contest/contest.html?contest_id=${cId}`, 1500);
            confirmRegBtn.disabled = true;
        }
    } catch (e) { showMessage(regStatusMsg, e.message); }
    confirmRegBtn.onclick = async () => {
        setLoading(confirmRegBtn, true);
        try {
            const res = await fetch(`${API_URL}/contest-registrations/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${getAuthToken()}` }, body: JSON.stringify({ contest: cId, user: user.id }) });
            if (res.ok) {
                showMessage(regStatusMsg, 'Success!', false);
                setTimeout(() => window.location.href = '../home/index.html', 1500);
            }
        } catch (e) { showMessage(regStatusMsg, e.message); } finally { setLoading(confirmRegBtn, false); }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('confirm-reg-btn')) initRegistrationPage();
});
