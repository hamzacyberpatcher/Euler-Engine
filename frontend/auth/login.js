if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value, p = document.getElementById('login-password').value;
        setLoading(loginBtn, true);
        const pay = u.includes('@') ? { email: u, password: p } : { username: u, password: p };
        try {
            const r = await fetch(`${API_URL}/login/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pay) });
            const d = await r.json();
            if (r.ok) {
                localStorage.setItem('euler_token', d.token);
                localStorage.setItem('euler_user', JSON.stringify({ id: d.user_id, username: d.username, email: d.email, is_staff: d.is_staff }));
                window.location.href = '../home/index.html';
            }
        } catch (err) { console.error(err); }
        finally { setLoading(loginBtn, false); }
    });
}
