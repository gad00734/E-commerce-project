// Ensure default admin is added
document.addEventListener('DOMContentLoaded', () => {
    ensureDefaultAdmin();
});

// Get form and inputs
const registerForm = document.getElementById('registerForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Add default admin to localStorage (if not present)
function ensureDefaultAdmin() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const adminExists = users.some(user => user.role === 'admin');

    if (!adminExists) {
        users.push({
            name: 'Admin',
            email: 'admin@test.com',
            password: 'admin123',
            role: 'admin'
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Validate Email Format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate Password Strength
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}


// Show Error Message
function showError(input, message) {
    input.classList.add('is-invalid');
    const errorElement = input.parentNode.querySelector('.invalid-feedback') || document.createElement('div');
    errorElement.className = 'invalid-feedback';
    errorElement.textContent = message;
    if (!input.parentNode.contains(errorElement)) {
        input.parentNode.appendChild(errorElement);
    }
}

// Clear all Errors
function clearErrors() {
    const errorElements = document.querySelectorAll('.invalid-feedback');
    errorElements.forEach(error => error.remove());
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => input.classList.remove('is-invalid'));
}

// Save User Data
function saveUserData(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];

    users.push({
        name: name,
        email: email,
        password: password,
        role: 'customer'
    });

    localStorage.setItem('users', JSON.stringify(users));
}

// Handle Form Submit
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    let isValid = true;

    if (!name) {
        showError(nameInput, 'Name is required');
        isValid = false;
    }

    if (!isValidEmail(email)) {
        showError(emailInput, 'Invalid email address');
        isValid = false;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.email === email)) {
        showError(emailInput, 'Email already registered');
        isValid = false;
    }

    if (!isValidPassword(password)) {
        showError(passwordInput, 'Password must be at least 8 characters, include uppercase, lowercase, and a number');
        isValid = false;
    }

    if (password !== confirmPassword) {
        showError(confirmPasswordInput, 'Passwords do not match');
        isValid = false;
    }

    if (isValid) {
        saveUserData(name, email, password);
        
        // Automatically log in the user after registration
        const loggedInUser = {
            email: email,
            name: name,
            role: 'customer'
        };
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        
        alert('Registration successful! You are now logged in.');
        window.location.href = 'index.html';
    }
});
