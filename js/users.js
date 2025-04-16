// Protect the page: only admin can access
const users = JSON.parse(localStorage.getItem('users')) || [];
const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
if (!currentUser || currentUser.role !== "admin") {
    alert("Access Denied");
    window.location.href = "login.html";
}

// DOM Elements
const userTableBody = document.querySelector("#userTable tbody");
const addUserBtn = document.getElementById("addUserBtn");
const userModal = new bootstrap.Modal(document.getElementById("userModal"));
const userForm = document.getElementById("userForm");
const emailInput = document.getElementById("userEmail");
const passwordInput = document.getElementById("userPassword");
const roleInput = document.getElementById("userRole");
const editIndexInput = document.getElementById("editIndex");

// Fetch users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

// Save users to localStorage
function setUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// Show toast notification
function showToast(message) {
    const toastEl = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastEl);
    document.getElementById('toast-message').textContent = message;
    toast.show();
}

// Render users in table
function renderUsers() {
    const users = getUsers();
    userTableBody.innerHTML = "";

    users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.email}</td>
            <td><span class="badge bg-${user.role === 'admin' ? 'success' : 'primary'}">${user.role}</span></td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editUser(${index})">
                    <i class="bi bi-pencil-square"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${index})">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        `;
        userTableBody.appendChild(row);
    });

    if (users.length === 0) {
        userTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">No users found</td>
            </tr>
        `;
    }
}

// Add or Update User
userForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleInput.value;
    const editIndex = editIndexInput.value;

    let users = getUsers();

    // Check for duplicate email (on add)
    const existingIndex = users.findIndex(u => u.email === email);
    if (editIndex === "" && existingIndex !== -1) {
        showToast("Email already exists!");
        return;
    }

    const userData = { email, password, role };

    if (editIndex === "") {
        // Add new user
        users.push(userData);
        showToast("User added successfully!");
    } else {
        // Update existing user
        users[editIndex] = userData;
        showToast("User updated successfully!");
    }

    setUsers(users);
    userForm.reset();
    editIndexInput.value = "";
    userModal.hide();
    renderUsers();
});

// Open modal to add user
addUserBtn.addEventListener("click", () => {
    userForm.reset();
    editIndexInput.value = "";
    document.getElementById('userModalLabel').textContent = "Add New User";
    userModal.show();
});

// Edit user
window.editUser = function(index) {
    const users = getUsers();
    const user = users[index];

    emailInput.value = user.email;
    passwordInput.value = user.password;
    roleInput.value = user.role;
    editIndexInput.value = index;
    document.getElementById('userModalLabel').textContent = "Edit User";

    userModal.show();
};

// Delete user
window.deleteUser = function(index) {
    if (confirm("Are you sure you want to delete this user?")) {
        const users = getUsers();
        users.splice(index, 1);
        setUsers(users);
        renderUsers();
        showToast("User deleted successfully!");
    }
};

// Initial render
renderUsers();
