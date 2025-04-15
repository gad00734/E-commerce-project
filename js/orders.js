// Get current user's ID
function getCurrentUserId() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    return loggedInUser ? loggedInUser.id || loggedInUser.username : null;
}

// Get user-specific storage key
function getUserStorageKey(key) {
    const userId = getCurrentUserId();
    return userId ? `${userId}_${key}` : key;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const userId = getCurrentUserId();
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }
    displayOrders();
    updateCartCount();
    updateWishlistCount();
    setupLogoutHandler();
});

// Display orders
function displayOrders() {
    const ordersKey = getUserStorageKey('orders');
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
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
                <td>$${order.totalPrice.toFixed(2)}</td>
                <td>
                    <span class="badge bg-${getStatusBadgeClass(order.status)}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showOrderDetails('${order.orderID}')">
                        View Details
                    </button>
                </td>
            </tr>
        `).join('');
}

// Show order details in modal
function showOrderDetails(orderId) {
    const ordersKey = getUserStorageKey('orders');
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
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
                <span class="badge bg-${getStatusBadgeClass(order.status)}">${order.status}</span>
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
                        <strong>$${order.subtotal.toFixed(2)}</strong>
                    </p>
                    <p class="d-flex justify-content-between mb-1">
                        <span>Shipping:</span>
                        <strong>$${order.shipping.toFixed(2)}</strong>
                    </p>
                    <p class="d-flex justify-content-between mb-0 h5">
                        <span>Total:</span>
                        <strong>$${order.totalPrice.toFixed(2)}</strong>
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
        case 'processing':
            return 'warning';
        case 'shipped':
            return 'info';
        case 'delivered':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Update cart counter
function updateCartCount() {
    const cartKey = getUserStorageKey('cart');
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Update wishlist counter
function updateWishlistCount() {
    const wishlistKey = getUserStorageKey('wishlist');
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

// Setup logout handler
function setupLogoutHandler() {
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });
    }
}

// Show toast notification
function showToast(message) {
    const toastElement = document.getElementById('liveToast');
    const toastMsg = document.getElementById('toast-message');
    if (toastMsg && toastElement) {
        toastMsg.textContent = message;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }
}
  