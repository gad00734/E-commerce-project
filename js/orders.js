// Check if user is logged in
function isUserLoggedIn() {
    return localStorage.getItem('loggedInUser') !== null;
}

// Get current user's ID
function getCurrentUserId() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    return loggedInUser ? loggedInUser.id : null;
}

// Get user-specific storage key
function getUserStorageKey(key) {
    const userId = getCurrentUserId();
    return userId ? `${userId}_${key}` : key;
}

// Update navbar based on login state
function updateNavbar() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    
    // Get all navbar elements
    const loginItem = document.getElementById("nav-login");
    const registerItem = document.getElementById("nav-register");
    const logoutItem = document.getElementById("nav-logout");
    const ordersItem = document.getElementById("nav-orders");
    const wishlistItem = document.getElementById("nav-wishlist");
    const profileItem = document.getElementById("nav-profile");
    const usernameDisplay = document.getElementById("username-display");
    const cartCount = document.getElementById("cart-count");

    if (loggedInUser) {
        // Show user-specific items
        if (loginItem) loginItem.style.display = "none";
        if (registerItem) registerItem.style.display = "none";
        if (logoutItem) logoutItem.style.display = "block";
        if (ordersItem) ordersItem.style.display = "block";
        if (wishlistItem) wishlistItem.style.display = "block";
        if (profileItem) profileItem.style.display = "block";
        
        // Update username display
        if (usernameDisplay) {
            const displayName = loggedInUser.username || loggedInUser.name || 'Guest';
            const nameParts = displayName.split(' ').filter(part => part.length > 0);
            usernameDisplay.textContent = nameParts.slice(0, 2).join(' ');
        }
        
        // Update counters
        updateCartCount();
        updateWishlistCount();
    } else {
        // Show login/register items
        if (loginItem) loginItem.style.display = "block";
        if (registerItem) registerItem.style.display = "block";
        if (logoutItem) logoutItem.style.display = "none";
        if (ordersItem) ordersItem.style.display = "none";
        if (wishlistItem) wishlistItem.style.display = "none";
        if (profileItem) profileItem.style.display = "none";
        
        // Reset displays
        if (usernameDisplay) usernameDisplay.textContent = "Guest";
        if (cartCount) cartCount.textContent = "0";
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    displayOrders();
    updateNavbar();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });
}

// Display orders
function displayOrders() {
    const userId = getCurrentUserId();
    if (!userId) return;

    const orders = JSON.parse(localStorage.getItem(`${userId}_orders`)) || [];
    const ordersTableBody = document.getElementById('ordersTableBody');
    const noOrders = document.getElementById('noOrders');

    if (orders.length === 0) {
        ordersTableBody.innerHTML = '';
        noOrders.classList.remove('d-none');
        return;
    }

    noOrders.classList.add('d-none');
    ordersTableBody.innerHTML = orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(order => `
            <tr>
                <td>${order.orderID}</td>
                <td>${order.date}</td>
                <td>${order.items.length} items</td>
                <td>$${order.totalPrice}</td>
                <td>
                    <span class="badge status-badge bg-${getStatusBadgeClass(order.status)}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showOrderDetails('${order.orderID}')">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
}

// Get tracking steps based on order status
function getTrackingSteps(order) {
    const steps = [
        { status: 'pending', icon: 'bi-clock', text: 'Order Placed' },
        { status: 'processing', icon: 'bi-gear', text: 'Processing' },
        { status: 'shipped', icon: 'bi-truck', text: 'Shipped' },
        { status: 'delivered', icon: 'bi-check-circle', text: 'Delivered' }
    ];

    const currentStatus = order.status.toLowerCase();
    let hasReachedCurrent = false;

    if (currentStatus === 'cancelled') {
        return `
            <div class="tracking-step">
                <div class="step-icon active">
                    <i class="bi bi-x-circle"></i>
                </div>
                <div class="step-content">
                    <h6 class="mb-1">Order Cancelled</h6>
                    <div class="step-date">${order.date}</div>
                </div>
            </div>
        `;
    }

    return steps.map(step => {
        if (currentStatus === step.status) hasReachedCurrent = true;
        const isActive = !hasReachedCurrent || currentStatus === step.status;
        
        return `
            <div class="tracking-step">
                <div class="step-icon ${isActive ? 'active' : ''}">
                    <i class="bi ${step.icon}"></i>
                </div>
                <div class="step-content">
                    <h6 class="mb-1">${step.text}</h6>
                    ${isActive ? `<div class="step-date">${
                        step.status === 'pending' ? order.date : 
                        new Date().toLocaleString()
                    }</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
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

    const modalContent = document.getElementById('orderDetailsContent');
    modalContent.innerHTML = `
        <div class="mb-4">
            <h6>Order Information</h6>
            <p class="mb-1"><strong>Order ID:</strong> ${order.orderID}</p>
            <p class="mb-1"><strong>Date:</strong> ${order.date}</p>
            <p class="mb-1"><strong>Status:</strong> 
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

        <div class="tracking-timeline mb-4">
            ${getTrackingSteps(order)}
        </div>

        <div class="border-top pt-3">
            <div class="row">
                <div class="col-md-6 offset-md-6">
                    <p class="d-flex justify-content-between mb-1">
                        <span>Subtotal:</span>
                        <strong>$${order.totalPrice}</strong>
                    </p>
                    <p class="d-flex justify-content-between mb-0 h5">
                        <span>Total:</span>
                        <strong>$${order.totalPrice}</strong>
                    </p>
                </div>
            </div>
        </div>
    `;

    const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    orderDetailsModal.show();
}

// Get appropriate badge class for order status
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

// Update cart count
function updateCartCount() {
    const userId = getCurrentUserId();
    const cart = JSON.parse(localStorage.getItem(`${userId}_cart`)) || [];
    document.getElementById('cartCount').textContent = cart.length;
}

// Update wishlist count
function updateWishlistCount() {
    const userId = getCurrentUserId();
    const wishlist = JSON.parse(localStorage.getItem(`${userId}_wishlist`)) || [];
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

// Show toast notification
function showToast(message) {
    const toastEl = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastEl);
    document.getElementById('toast-message').textContent = message;
    toast.show();
}
  