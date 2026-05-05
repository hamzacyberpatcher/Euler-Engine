async function initProblemPage() {
    const p = new URLSearchParams(window.location.search), pId = p.get('problem_id'), cId = p.get('contest_id'), user = getAuthUser();
    if (!user || !pId || !cId) { window.location.href = '../home/index.html'; return; }
    try {
        const [rP, rC] = await Promise.all([fetch(`${API_URL}/problems/${pId}/`), fetch(`${API_URL}/contests/${cId}/`)]);
        const pD = await rP.json(), cD = await rC.json();
        const isEnded = new Date() > new Date(cD.end_time);

        probTitle.textContent = pD.title; probCategory.textContent = pD.category; probRating.textContent = `${pD.rating} Points`; probStatement.textContent = pD.statement;

        if (isEnded) {
            submitProbBtn.disabled = true;
            submitProbBtn.textContent = 'Contest Ended';
            submitProbBtn.style.background = '#3d4255';
            submitProbBtn.style.cursor = 'not-allowed';
            solutionText.disabled = true;
            solutionText.placeholder = 'Contest has ended. You can no longer submit solutions.';
            showMessage(submissionMsg, 'Contest has ended. Submissions are closed.', true);
        }
    } catch (e) { console.error(e); }
    submitProbBtn.onclick = async () => {
        const t = solutionText.value.trim(); if (!t) return;
        setLoading(submitProbBtn, true);
        try {
            const res = await fetch(`${API_URL}/submissions/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${getAuthToken()}` }, body: JSON.stringify({ contest: cId, problem: pId, user: user.id, answer_text: t }) });
            if (res.ok) { showMessage(submissionMsg, 'Success!', false); solutionText.value = ''; setTimeout(() => window.location.href = `../contest/contest.html?contest_id=${cId}`, 1500); }
        } catch (e) { console.error(e); } finally { setLoading(submitProbBtn, false); }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('submit-prob-btn')) initProblemPage();
});
