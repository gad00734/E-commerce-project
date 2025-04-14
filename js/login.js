// create first admin
if (!localStorage.getItem("users")) {
    const defaultAdmin = [
      {
        email: "admin@test.com",
        password: "admin123", // ممكن تغيره طبعًا
        role: "admin"
      }
    ];
    localStorage.setItem("users", JSON.stringify(defaultAdmin));
  }
  

// Select form and input elements
const loginForm = document.querySelector('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Display Error Message
function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;

    loginForm.insertAdjacentElement('beforebegin', errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Display Success Message
function displaySuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;

    loginForm.insertAdjacentElement('beforebegin', successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Save Remember Me Data
function saveRememberMe(email, rememberMe) {
    if (rememberMe) {
        localStorage.setItem('rememberMe', email);
    } else {
        localStorage.removeItem('rememberMe');
    }
}

// Load Remember Me Data
function loadRememberMe() {
    const savedEmail = localStorage.getItem('rememberMe');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
}

// Form Submission Event Listener
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;

    // Retrieve users from localStorage (or default to an empty array)
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if user exists
    const user = users.find((user) => user.email === email && user.password === password);

    if (user) {
        // Save Remember Me preference
        saveRememberMe(email, rememberMe);

        // Successful Login
        displaySuccess('Login successful! Redirecting...');

        // Redirect based on the user role
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'users.html';  // Redirect to admin page
            } else {
                window.location.href = 'index.html';  // Redirect to customer page
            }
        }, 2000);
    } else {
        // Invalid Credentials
        displayError('Invalid email or password. Please try again.');
    }
});

// Load Remember Me Data on Page Load
document.addEventListener('DOMContentLoaded', loadRememberMe);
