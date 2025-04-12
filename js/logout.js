
document.addEventListener("DOMContentLoaded", function () {
  
    localStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("loggedInUser");

  
    const msgDiv = document.getElementById("logoutMessage");
    msgDiv.classList.remove("d-none");

   
    sessionStorage.setItem("logoutSuccess", "You have been logged out successfully.");

   
    setTimeout(() => {
        window.location.href = "Login.html";
    }, 1500);
});
