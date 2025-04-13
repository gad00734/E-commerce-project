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

    // Load data from localStorage
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const categoriesCount = 10;  // This is an example, you can replace this with real data
    const pendingOrdersCount = 5;  // This is an example, you can replace this with real data

    // Update counts
    document.querySelector(".card-text:nth-of-type(1)").textContent = `Total Products: ${products.length}`;
    document.querySelector(".card-text:nth-of-type(2)").textContent = `Total Categories: ${categoriesCount}`;
    document.querySelector(".card-text:nth-of-type(3)").textContent = `Pending Orders: ${pendingOrdersCount}`;

    // Update recent orders
    const recentOrders = [
        { id: "001", customer: "John Doe", status: "Pending", total: "$150" },
        { id: "002", customer: "Jane Smith", status: "Confirmed", total: "$200" },
    ];

    const tbody = document.querySelector("table tbody");
    tbody.innerHTML = ""; // Clear old static rows

    recentOrders.forEach(order => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.status}</td>
            <td>${order.total}</td>
            <td><a href="#" class="btn btn-warning">Review</a></td>
        `;
        tbody.appendChild(row);
    });
});
