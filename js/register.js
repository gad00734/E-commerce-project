
const registerForm = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');
const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('confirmPassword');


registerForm.addEventListener('submit', async function (e) {
   
    e.preventDefault();
    
   
    registerError.style.display = 'none';

    
    const name = nameField.value;
    const email = emailField.value;
    const password = passwordField.value;
    const confirmPassword = confirmPasswordField.value;

 
    if (name === "" || email === "" || password === "" || confirmPassword === "") {
        registerError.style.display = 'block';
        registerError.textContent = 'Please fill in all fields.';
        return;  
    }

  
    if (password !== confirmPassword) {
        registerError.style.display = 'block';
        registerError.textContent = 'Passwords do not match.';
        return; 
    }

    registerError.style.display = 'none';
    registerError.textContent = '';

    
    const userData = {
        name,
        email,
        password
    };

    try {
        
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();  

        if (data.success) {
            
            window.location.href = "Dashboard.html";  
        } else {
            registerError.style.display = 'block';
            registerError.textContent = data.message || 'Something went wrong!';
        }
    } catch (error) {
        
        registerError.style.display = 'block';
        registerError.textContent = 'Error occurred, please try again later.';
    }
});
