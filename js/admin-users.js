// Check admin authentication
function checkAdminAuth() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || loggedInUser.role !== 'admin') {
        window.location.href = 'index.html';
    }
    document.getElementById('adminName').textContent = loggedInUser.email.split('@')[0];
}

// Initialize page
async function initializePage() {
    checkAdminAuth();
    await loadUsers();
    setupEventListeners();
}

// Load users
async function loadUsers() {
    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const userOrders = orders.filter(order => order.userId === user.id);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.email}</td>
                <td>${user.username || 'N/A'}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'bg-admin' : 'bg-user'}">
                        ${user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                </td>
                <td>${userOrders.length}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-2" onclick="editUser(${user.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showToast('Error loading users');
        console.error('Error loading users:', error);
    }
}

// Add new user
async function addUser(event) {
    event.preventDefault();
    try {
        const email = document.getElementById('userEmail').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('userPassword').value;
        const confirmPassword = document.getElementById('userConfirmPassword').value;
        const isAdmin = document.getElementById('userIsAdmin').checked;

        // Validate passwords match
        if (password !== confirmPassword) {
            showToast('Passwords do not match');
            return;
        }

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email)) {
            showToast('Email already exists');
            return;
        }

        const newUser = {
            id: Date.now(),
            email,
            username,
            password, // In a real app, this should be hashed
            role: isAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        document.getElementById('addUserForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
        
        await loadUsers();
        showToast('User added successfully');
    } catch (error) {
        showToast('Error adding user');
        console.error('Error adding user:', error);
    }
}

// Edit user
function editUser(userId) {
    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.id === userId);
        if (!user) return;

        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUsername').value = user.username || '';
        document.getElementById('editUserIsAdmin').checked = user.role === 'admin';

        // Clear password fields
        document.getElementById('editUserPassword').value = '';
        document.getElementById('editUserConfirmPassword').value = '';

        new bootstrap.Modal(document.getElementById('editUserModal')).show();
    } catch (error) {
        showToast('Error loading user details');
        console.error('Error loading user details:', error);
    }
}

// Update user
async function updateUser(event) {
    event.preventDefault();
    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userId = parseInt(document.getElementById('editUserId').value);
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            showToast('User not found');
            return;
        }

        const newPassword = document.getElementById('editUserPassword').value;
        const confirmPassword = document.getElementById('editUserConfirmPassword').value;

        // Check if passwords match if a new password is being set
        if (newPassword && newPassword !== confirmPassword) {
            showToast('Passwords do not match');
            return;
        }

        // Check if we're removing the last admin
        const isLastAdmin = users[userIndex].role === 'admin' && 
                          !document.getElementById('editUserIsAdmin').checked &&
                          users.filter(u => u.role === 'admin').length === 1;

        if (isLastAdmin) {
            showToast('Cannot remove the last admin user');
            return;
        }

        // Update user object
        users[userIndex] = {
            ...users[userIndex],
            username: document.getElementById('editUsername').value,
            role: document.getElementById('editUserIsAdmin').checked ? 'admin' : 'user',
            ...(newPassword && { password: newPassword }), // Only update password if a new one is provided
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify(users));
        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
        
        await loadUsers();
        showToast('User updated successfully');
    } catch (error) {
        showToast('Error updating user');
        console.error('Error updating user:', error);
    }
}

// Delete user
async function deleteUser(userId) {
    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.id === userId);

        if (!user) {
            showToast('User not found');
            return;
        }

        if (user.role === 'admin') {
            showToast('Cannot delete admin users');
            return;
        }

        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const hasOrders = orders.some(order => order.userId === userId);

        if (hasOrders) {
            showToast('Cannot delete user with existing orders');
            return;
        }

        if (!confirm('Are you sure you want to delete this user?')) return;

        const updatedUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        await loadUsers();
        showToast('User deleted successfully');
    } catch (error) {
        showToast('Error deleting user');
        console.error('Error deleting user:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('saveUserBtn').addEventListener('click', addUser);
    document.getElementById('updateUserBtn').addEventListener('click', updateUser);
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    });
}

// Show toast notification
function showToast(message) {
    const toastEl = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastEl);
    document.getElementById('toast-message').textContent = message;
    toast.show();
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 