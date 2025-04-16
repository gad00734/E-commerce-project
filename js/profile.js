// Check if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    loadUserProfile();
    loadRecentOrders();
    loadWishlist();
    updateCartCount();
    updateWishlistCount();
    setupEventListeners();
});

// Load user profile information
function loadUserProfile() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    // Update header information
    document.getElementById('userName').textContent = loggedInUser.name || loggedInUser.email.split('@')[0];
    document.getElementById('userEmail').textContent = loggedInUser.email;
    
    if (loggedInUser.profileImage) {
        document.getElementById('profileImage').src = loggedInUser.profileImage;
        document.querySelector('#profileForm img').src = loggedInUser.profileImage;
    }

    // Update form fields
    document.getElementById('fullName').value = loggedInUser.name || '';
    document.getElementById('email').value = loggedInUser.email;
    document.getElementById('phone').value = loggedInUser.phone || '';
    document.getElementById('address').value = loggedInUser.address || '';
}

// Load recent orders
function loadRecentOrders() {
    const userId = getCurrentUserId();
    const orders = JSON.parse(localStorage.getItem(`${userId}_orders`)) || [];
    const recentOrdersContainer = document.getElementById('recentOrders');

    if (orders.length === 0) {
        recentOrdersContainer.innerHTML = '<p class="text-muted text-center">No orders found</p>';
        return;
    }

    // Sort orders by date (most recent first) and get last 5
    const recentOrders = orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recentOrdersContainer.innerHTML = recentOrders.map(order => `
        <div class="card mb-3 order-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="card-subtitle text-muted">Order ID: ${order.orderID}</h6>
                    <span class="badge bg-${getStatusBadgeClass(order.status)} status-badge">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>
                <p class="card-text mb-1">Date: ${new Date(order.date).toLocaleString()}</p>
                <p class="card-text mb-1">Items: ${order.items.length}</p>
                <p class="card-text">Total: $${order.totalPrice}</p>
                <button class="btn btn-outline-primary btn-sm" onclick="showOrderDetails('${order.orderID}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Load wishlist items
function loadWishlist() {
    const userId = getCurrentUserId();
    const wishlist = JSON.parse(localStorage.getItem(`${userId}_wishlist`)) || [];
    const wishlistContainer = document.getElementById('wishlistItems');

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p class="text-muted text-center">Your wishlist is empty</p>';
        return;
    }

    wishlistContainer.innerHTML = wishlist.map(item => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100">
                <img src="${item.image}" class="card-img-top" alt="${item.name}" 
                     style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">$${item.price}</p>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-primary btn-sm" onclick="addToCart(${item.id})">
                            Add to Cart
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="removeFromWishlist(${item.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    
    // Settings form submission
    document.getElementById('settingsForm').addEventListener('submit', handlePasswordUpdate);
    
    // Profile picture change
    document.getElementById('profilePicture').addEventListener('change', handleProfilePictureChange);
    
    // Delete account
    document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const updatedUser = {
            ...loggedInUser,
            name: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };

        // Update user in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        
        // Update users array
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === loggedInUser.id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('users', JSON.stringify(users));
        }

        showToast('Profile updated successfully');
        loadUserProfile();
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Error updating profile');
    }
}

// Handle password update
async function handlePasswordUpdate(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match');
        return;
    }

    try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === loggedInUser.id);

        if (userIndex === -1) {
            showToast('User not found');
            return;
        }

        if (users[userIndex].password !== currentPassword) {
            showToast('Current password is incorrect');
            return;
        }

        // Update password
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update logged in user
        loggedInUser.password = newPassword;
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

        showToast('Password updated successfully');
        document.getElementById('settingsForm').reset();
    } catch (error) {
        console.error('Error updating password:', error);
        showToast('Error updating password');
    }
}

// Handle profile picture change
async function handleProfilePictureChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file');
        return;
    }

    try {
        const base64Image = await convertImageToBase64(file);
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        
        // Update profile image
        loggedInUser.profileImage = base64Image;
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

        // Update users array
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === loggedInUser.id);
        if (userIndex !== -1) {
            users[userIndex].profileImage = base64Image;
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Update UI
        document.getElementById('profileImage').src = base64Image;
        document.querySelector('#profileForm img').src = base64Image;
        showToast('Profile picture updated successfully');
    } catch (error) {
        console.error('Error updating profile picture:', error);
        showToast('Error updating profile picture');
    }
}

// Handle delete account
function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Remove user from users array
        const updatedUsers = users.filter(u => u.id !== loggedInUser.id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        // Clear user-specific data
        const userId = loggedInUser.id;
        localStorage.removeItem(`${userId}_cart`);
        localStorage.removeItem(`${userId}_wishlist`);
        localStorage.removeItem(`${userId}_orders`);
        localStorage.removeItem('loggedInUser');

        // Redirect to login page
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error deleting account:', error);
        showToast('Error deleting account');
    }
}

// Utility Functions
function getCurrentUserId() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    return loggedInUser ? loggedInUser.id : null;
}

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'processing':
            return 'info';
        case 'shipped':
            return 'primary';
        case 'delivered':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

function updateCartCount() {
    const userId = getCurrentUserId();
    const cart = JSON.parse(localStorage.getItem(`${userId}_cart`)) || [];
    document.getElementById('cartCount').textContent = cart.length;
}

function updateWishlistCount() {
    const userId = getCurrentUserId();
    const wishlist = JSON.parse(localStorage.getItem(`${userId}_wishlist`)) || [];
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

function showToast(message) {
    const toastEl = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastEl);
    document.getElementById('toast-message').textContent = message;
    toast.show();
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

// Add to cart function
function addToCart(productId) {
    const userId = getCurrentUserId();
    if (!userId) {
        showToast('Please log in to add items to cart');
        return;
    }

    const cartKey = `${userId}_cart`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const wishlist = JSON.parse(localStorage.getItem(`${userId}_wishlist`)) || [];
    const product = wishlist.find(item => item.id === productId);

    if (!product) {
        showToast('Product not found');
        return;
    }

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
    showToast('Product added to cart');
}

// Remove from wishlist function
function removeFromWishlist(productId) {
    const userId = getCurrentUserId();
    const wishlistKey = `${userId}_wishlist`;
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    
    const updatedWishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
    
    loadWishlist();
    updateWishlistCount();
    showToast('Product removed from wishlist');
}

// Show order details
function showOrderDetails(orderId) {
    const userId = getCurrentUserId();
    const orders = JSON.parse(localStorage.getItem(`${userId}_orders`)) || [];
    const order = orders.find(o => o.orderID === orderId);

    if (!order) {
        showToast('Order not found');
        return;
    }

    // Create and show modal
    const modalHtml = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Order Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <h6>Order Information</h6>
                            <p class="mb-1"><strong>Order ID:</strong> ${order.orderID}</p>
                            <p class="mb-1"><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                            <p class="mb-1">
                                <strong>Status:</strong> 
                                <span class="badge bg-${getStatusBadgeClass(order.status)}">
                                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </p>
                        </div>
                        <div class="mb-4">
                            <h6>Items</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr>
                                                <td>
                                                    <div class="d-flex align-items-center">
                                                        <img src="${item.image}" alt="${item.name}" 
                                                             class="me-2" style="width: 50px; height: 50px; object-fit: cover;">
                                                        <span>${item.name}</span>
                                                    </div>
                                                </td>
                                                <td>$${item.price.toFixed(2)}</td>
                                                <td>${item.quantity}</td>
                                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="border-top pt-3">
                            <div class="row">
                                <div class="col-md-6 offset-md-6">
                                    <p class="d-flex justify-content-between mb-1">
                                        <span>Subtotal:</span>
                                        <strong>$${order.subtotal || order.totalPrice}</strong>
                                    </p>
                                    <p class="d-flex justify-content-between mb-1">
                                        <span>Shipping:</span>
                                        <strong>$${order.shipping || '0.00'}</strong>
                                    </p>
                                    <p class="d-flex justify-content-between mb-0 h5">
                                        <span>Total:</span>
                                        <strong>$${order.totalPrice}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('orderDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
} 