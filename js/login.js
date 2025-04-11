const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
loginForm.addEventListener('submit', async function (e) {
    
    e.preventDefault();
    
   
    loginError.style.display = 'none';
 
 const email = emailField.value;
 const password = passwordField.value;


 if (email === "" || password === "") {
     loginError.style.display = 'block';
     loginError.textContent = 'Please fill in both fields.';
     return;  
 }
  loginError.style.display = 'none';
  loginError.textContent = '';

  const userData = {
      email,
      password
  };

  try {
      const response = await fetch('/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
      });

      const data = await response.json(); 
      if (data.success) {
         
          window.location.href = "/dashboard";  
      } else {
          loginError.style.display = 'block';
          loginError.textContent = data.message || 'Something went wrong!';
      }
  } catch (error) {
      loginError.style.display = 'block';
      loginError.textContent = 'Error occurred, please try again later.';
  }
});