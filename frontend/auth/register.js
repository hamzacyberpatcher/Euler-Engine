if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const b = document.getElementById('reg-btn'), p = { username: document.getElementById('reg-username').value, email: document.getElementById('reg-email').value, password: document.getElementById('reg-password').value };
        setLoading(b, true);
        try {
            const r = await fetch(`${API_URL}/register/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
            if (r.ok) {
                showMessage(registerMessage, 'Success!', false);
                setTimeout(() => window.location.href = 'login.html', 1500);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(b, false); }
    });
}