const registerForm = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');
const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('confirmPassword');

registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    registerError.style.display = 'none';

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const password = passwordField.value;
    const confirmPassword = confirmPasswordField.value;

    if (!name || !email || !password || !confirmPassword) {
        registerError.textContent = "Please fill in all fields.";
        registerError.style.display = 'block';
        return;
    }

    if (password !== confirmPassword) {
        registerError.textContent = "Passwords do not match.";
        registerError.style.display = 'block';
        return;
    }

   
    const user = {
        name,
        email,
        password,
    };

   
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === email)) {
        registerError.textContent = "Email is already registered.";
        registerError.style.display = 'block';
        return;
    }

    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));

   
    sessionStorage.setItem("registerSuccess", "Account created successfully! Please log in.");
    window.location.href = "Login.html";
});
