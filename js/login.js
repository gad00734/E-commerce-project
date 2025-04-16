// Initialize admin user if not exists
function initializeAdminUser() {
    const adminUser = {
        id: 'admin',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        password: 'admin123' // Store password for demo purposes
    };
    
    // Check if admin user exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const adminExists = users.some(user => user.role === 'admin');
    
    if (!adminExists) {
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminUser();
    setupLoginForm();
});

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check for admin login
    if (username === 'admin' && password === 'admin123') {
        const adminUser = users.find(user => user.role === 'admin');
        if (adminUser) {
            localStorage.setItem('loggedInUser', JSON.stringify(adminUser));
            showToast('Admin login successful');
            setTimeout(() => {
                window.location.href = 'admin-panel.html';  // Redirect to admin panel
            }, 1500);
            return;
        }
    }
    
    // Regular user login
    const user = users.find(u => 
        (u.username === username || u.email === username) && 
        u.password === password
    );
    
    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        showToast('Login successful');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showToast('Invalid credentials');
    }
}

// Show toast notification
function showToast(message) {
    const toastElement = document.getElementById('liveToast');
    const toastMsg = document.getElementById('toast-message');
    if (toastMsg && toastElement) {
        toastMsg.textContent = message;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }
}
