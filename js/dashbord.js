document.addEventListener("DOMContentLoaded", function () {
    let loggedInUser = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");

    if (!loggedInUser) {
       
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(loggedInUser);
    const welcomeUser = document.getElementById("welcomeUser");
    if (welcomeUser) {
        welcomeUser.textContent = `Welcome, ${user.name}`;

    }

   
    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("loggedInUser");
            sessionStorage.removeItem("loggedInUser");
            sessionStorage.setItem("logoutSuccess", "You have been logged out successfully.");
            window.location.href = "logout.html";
        });
    }
});
