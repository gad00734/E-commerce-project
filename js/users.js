// Protect the page: only admin can access
const users = JSON.parse(localStorage.getItem('users')) || [];
const currentUser = users.find(user => user.email === 'admin@test.com'); // استبدل بالبريد الإلكتروني الحالي
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

// Render users in table
function renderUsers() {
  const users = getUsers();
  userTableBody.innerHTML = "";

  users.forEach((user, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick="editUser(${index})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser(${index})">Delete</button>
      </td>
    `;

    userTableBody.appendChild(row);
  });
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
    alert("Email already exists!");
    return;
  }

  const userData = { email, password, role };

  if (editIndex === "") {
    // Add new user
    users.push(userData);
  } else {
    // Update existing user
    users[editIndex] = userData;
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
  userModal.show();
});

// Edit user
window.editUser = function (index) {
  const users = getUsers();
  const user = users[index];

  emailInput.value = user.email;
  passwordInput.value = user.password;
  roleInput.value = user.role;
  editIndexInput.value = index;

  userModal.show();
};

// Delete user
window.deleteUser = function (index) {
  if (confirm("Are you sure you want to delete this user?")) {
    const users = getUsers();
    users.splice(index, 1);
    setUsers(users);
    renderUsers();
  }
};

// Initial render
renderUsers();

// Clear the current user data from localStorage
function logout() {
    localStorage.removeItem('user'); // أو لو بتخزن المستخدمين في 'users' فيكون .removeItem('users')
    window.location.href = 'login.html'; // إعادة التوجيه إلى صفحة تسجيل الدخول
}

// لو فيه زرار "Logout" في صفحة الـ Admin أو الـ Customer
document.getElementById('logoutBtn').addEventListener('click', logout);
