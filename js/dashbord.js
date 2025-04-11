
    
    const user = 
        JSON.parse(localStorage.getItem('loggedInUser')) || 
        JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (user) {
        document.getElementById('welcomeUser').textContent = `Welcome, ${user.name}`;
    } else {
        
        window.location.href = "login.html";
    }

  
    const logoutLink = document.querySelector('a[href="login.html"]');
    logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('loggedInUser');
        window.location.href = "login.html";
    });

