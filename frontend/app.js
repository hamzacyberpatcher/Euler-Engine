const API_URL = 'http://localhost:8000/api';

// DOM Elements
const loginBox = document.getElementById('login-box');
const registerBox = document.getElementById('register-box');
const authBox = document.getElementById('auth-box');

const goToRegister = document.getElementById('go-to-register');
const goToLogin = document.getElementById('go-to-login');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const loginMessage = document.getElementById('login-message');
const registerMessage = document.getElementById('register-message');

const authUsername = document.getElementById('auth-username');
const authEmail = document.getElementById('auth-email');
const authToken = document.getElementById('auth-token');
const logoutBtn = document.getElementById('logout-btn');

const loginBtn = document.getElementById('login-btn');
const regBtn = document.getElementById('reg-btn');

// View Switching
function showBox(boxToShow) {
    [loginBox, registerBox, authBox].forEach(box => {
        box.classList.add('hidden');
    });
    boxToShow.classList.remove('hidden');
}

goToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showBox(registerBox);
    clearMessages();
});

goToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showBox(loginBox);
    clearMessages();
});

function clearMessages() {
    loginMessage.textContent = '';
    loginMessage.className = 'message';
    registerMessage.textContent = '';
    registerMessage.className = 'message';
}

function showMessage(element, message, isError = true) {
    element.textContent = message;
    element.className = `message ${isError ? 'error' : 'success'}`;
}

function setLoading(btn, isLoading) {
    if (isLoading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Check if already logged in
function checkAuth() {
    const token = localStorage.getItem('euler_token');
    const userStr = localStorage.getItem('euler_user');
    
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            authUsername.textContent = user.username;
            authEmail.textContent = user.email || 'N/A';
            authToken.textContent = token;
            showBox(authBox);
        } catch (e) {
            localStorage.removeItem('euler_token');
            localStorage.removeItem('euler_user');
            showBox(loginBox);
        }
    } else {
        showBox(loginBox);
    }
}

// Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    setLoading(regBtn, true);
    
    try {
        const response = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            let errorMsg = 'Registration failed';
            if (typeof data === 'object') {
                const msgs = Object.values(data).flat();
                if (msgs.length > 0) errorMsg = msgs.join(', ');
            }
            throw new Error(errorMsg);
        }
        
        showMessage(registerMessage, 'Registration successful! You can now login.', false);
        registerForm.reset();
        
        // Auto switch to login after 2 seconds
        setTimeout(() => {
            document.getElementById('login-username').value = username;
            showBox(loginBox);
        }, 2000);
        
    } catch (error) {
        showMessage(registerMessage, error.message);
    } finally {
        setLoading(regBtn, false);
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    
    const usernameOrEmail = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    setLoading(loginBtn, true);
    
    const isEmail = usernameOrEmail.includes('@');
    const payload = { password };
    
    if (isEmail) {
        payload.email = usernameOrEmail;
    } else {
        payload.username = usernameOrEmail;
    }
    
    try {
        const response = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            let errorMsg = 'Login failed';
            if (data.non_field_errors) {
                errorMsg = data.non_field_errors[0];
            } else if (typeof data === 'object') {
                const msgs = Object.values(data).flat();
                if (msgs.length > 0) errorMsg = msgs.join(', ');
            }
            throw new Error(errorMsg);
        }
        
        // Save to local storage
        localStorage.setItem('euler_token', data.token);
        localStorage.setItem('euler_user', JSON.stringify({
            id: data.user_id,
            username: data.username,
            email: data.email
        }));
        
        loginForm.reset();
        checkAuth();
        
    } catch (error) {
        showMessage(loginMessage, error.message);
    } finally {
        setLoading(loginBtn, false);
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('euler_token');
    localStorage.removeItem('euler_user');
    showBox(loginBox);
});

// Initialize
checkAuth();
