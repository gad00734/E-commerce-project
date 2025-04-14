// Select form and input elements
const registerForm = document.getElementById('registerForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Validate Email Format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate Password Strength
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
}

// Show Error Messages
function showError(input, message) {
    input.classList.add('is-invalid');
    const errorElement = document.createElement('div');
    errorElement.className = 'invalid-feedback';
    errorElement.innerText = message;
    input.parentNode.appendChild(errorElement);
}

// Clear Error Messages
function clearErrors() {
    const errorElements = document.querySelectorAll('.invalid-feedback');
    errorElements.forEach(error => error.remove());
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => input.classList.remove('is-invalid'));
}

// Save Data to LocalStorage (Automatically add users)
function saveUserData(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if it's the first user registration and add default admin
    if (users.length === 0) {
        // Create a default admin if no users exist
        users.push({
            name: 'Admin',
            email: 'admin@test.com',
            password: 'admin123',
            role: 'admin'
        });
    }

    // Automatically add user as 'customer'
    users.push({ name, email, password, role: 'customer' });
    localStorage.setItem('users', JSON.stringify(users));
}

// Form Submission Handler
registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    clearErrors();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    let isValid = true;

    // Validate Name
    if (name === '') {
        showError(nameInput, 'Name is required');
        isValid = false;
    }

    // Validate Email
    if (!isValidEmail(email)) {
        showError(emailInput, 'Invalid email address');
        isValid = false;
    }

    // Check if Email Already Exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.email === email)) {
        showError(emailInput, 'Email already registered');
        isValid = false;
    }

    // Validate Password
    if (!isValidPassword(password)) {
        showError(passwordInput, 'Password must be at least 8 characters, include uppercase, lowercase, and a number');
        isValid = false;
    }

    // Validate Confirm Password
    if (password !== confirmPassword) {
        showError(confirmPasswordInput, 'Passwords do not match');
        isValid = false;
    }

    if (isValid) {
        // Save User Data Automatically (No need to ask for role)
        saveUserData(name, email, password);
        alert('Registration successful! You are now registered as a customer.');
        // Redirect to login page (optional)
        window.location.href = 'login.html';
    }
});
