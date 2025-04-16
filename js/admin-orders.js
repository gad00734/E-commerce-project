// Check if user is admin
function isAdmin() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    return loggedInUser && loggedInUser.role === 'admin';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (!isAdmin()) {
        showToast('Access denied. Admin privileges required.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }
    displayAllOrders();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterOrders(searchTerm);
    }, 300));

    // Status filter
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        const status = e.target.value;
        filterOrdersByStatus(status);
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    });
}

// Display all orders
function displayAllOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const noOrders = document.getElementById('noOrders');
    
    // Get all orders from all users
    const allOrders = getAllOrders();
    
    if (!allOrders || allOrders.length === 0) {
        ordersTableBody.innerHTML = '';
        noOrders.classList.remove('d-none');
        return;
    }

    noOrders.classList.add('d-none');
    ordersTableBody.innerHTML = allOrders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(order => {
            const status = order.status.toLowerCase();
            return `
                <tr>
                    <td>${order.orderID}</td>
                    <td>${order.date}</td>
                    <td>${order.userId || 'Guest'}</td>
                    <td>${order.items.length} items</td>
                    <td>$${order.totalPrice}</td>
                    <td>
                        <span class="badge status-badge bg-${getStatusBadgeClass(status)}">
                            ${status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary view-btn" data-order-id="${order.orderID}">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${status === 'pending' ? `
                            <button class="btn btn-sm btn-success accept-btn" data-order-id="${order.orderID}">
                                <i class="bi bi-check-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-danger cancel-btn" data-order-id="${order.orderID}">
                                <i class="bi bi-x-circle"></i>
                            </button>
                        ` : ''}
                        ${status === 'processing' ? `
                            <button class="btn btn-sm btn-info ship-btn" data-order-id="${order.orderID}">
                                <i class="bi bi-truck"></i>
                            </button>
                        ` : ''}
                        ${status === 'shipped' ? `
                            <button class="btn btn-sm btn-success deliver-btn" data-order-id="${order.orderID}">
                                <i class="bi bi-box-seam"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');

    // Add event listeners to buttons
    ordersTableBody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => showOrderDetails(btn.dataset.orderId));
    });

    ordersTableBody.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.orderId, 'processing'));
    });

    ordersTableBody.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.orderId, 'cancelled'));
    });

    ordersTableBody.querySelectorAll('.ship-btn').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.orderId, 'shipped'));
    });

    ordersTableBody.querySelectorAll('.deliver-btn').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.orderId, 'delivered'));
    });
}

// Get all orders from all users
function getAllOrders() {
    const allOrders = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
        if (key.endsWith('_orders')) {
            const orders = JSON.parse(localStorage.getItem(key)) || [];
            orders.forEach(order => {
                order.userId = key.split('_')[0]; // Add userId to order
                allOrders.push(order);
            });
        }
    });
    
    return allOrders;
}

// Filter orders by search term
function filterOrders(searchTerm) {
    const allOrders = getAllOrders();
    const filteredOrders = allOrders.filter(order => 
        order.orderID.toLowerCase().includes(searchTerm) ||
        order.userId.toLowerCase().includes(searchTerm) ||
        order.date.toLowerCase().includes(searchTerm)
    );
    displayFilteredOrders(filteredOrders);
}

// Filter orders by status
function filterOrdersByStatus(status) {
    const allOrders = getAllOrders();
    const filteredOrders = status === 'all' 
        ? allOrders 
        : allOrders.filter(order => order.status.toLowerCase() === status);
    displayFilteredOrders(filteredOrders);
}

// Display filtered orders
function displayFilteredOrders(orders) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const noOrders = document.getElementById('noOrders');
    
    if (!orders || orders.length === 0) {
        ordersTableBody.innerHTML = '';
        noOrders.classList.remove('d-none');
        return;
    }

    noOrders.classList.add('d-none');
    ordersTableBody.innerHTML = orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(order => {
            const status = order.status.toLowerCase();
            return `
                <tr>
                    <td>${order.orderID}</td>
                    <td>${order.date}</td>
                    <td>${order.userId || 'Guest'}</td>
                    <td>${order.items.length} items</td>
                    <td>$${order.totalPrice}</td>
                    <td>
                        <span class="badge status-badge bg-${getStatusBadgeClass(status)}">
                            ${status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary view-btn" data-order-id="${order.orderID}">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${status === 'pending' ? `
                            <button class="btn btn-sm btn-success accept-btn" data-order-id="${order.orderID}">
                                <i class="bi bi-check-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-danger cancel-btn" data-order-id="${order.orderID}">
                                <i class="bi bi-x-circle"></i>
                            </button>
                        ` : ''}
                        ${status === 'processing' ? `
                            <button class="btn btn-sm btn-info ship-btn" data-order-id="${order.orderID}">
                                <i class="bi bi-truck"></i>
                            </button>
                        ` : ''}
                        ${status === 'shipped' ? `
                            <button class="btn btn-sm btn-success deliver-btn" data-order-id="${order.orderID}">
                                <i class="bi bi-box-seam"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');

    // Add event listeners to buttons
    ordersTableBody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => showOrderDetails(btn.dataset.orderId));
    });

    ordersTableBody.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.orderId, 'processing'));
    });

    ordersTableBody.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.orderId, 'cancelled'));
    });

    ordersTableBody.querySelectorAll('.ship-btn').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.orderId, 'shipped'));
    });

    ordersTableBody.querySelectorAll('.deliver-btn').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.orderId, 'delivered'));
    });
}

// Show order details in modal
function showOrderDetails(orderId) {
    const allOrders = getAllOrders();
    const order = allOrders.find(o => o.orderID === orderId);

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
            <p class="mb-1"><strong>Customer:</strong> ${order.userId || 'Guest'}</p>
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
                        <strong>$${order.subtotal}</strong>
                    </p>
                    <p class="d-flex justify-content-between mb-1">
                        <span>Shipping:</span>
                        <strong>$${order.shipping}</strong>
                    </p>
                    <p class="d-flex justify-content-between mb-0 h5">
                        <span>Total:</span>
                        <strong>$${order.totalPrice}</strong>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Show/hide action buttons based on order status
    const acceptBtn = document.getElementById('acceptOrderBtn');
    const cancelBtn = document.getElementById('cancelOrderBtn');
    
    if (order.status.toLowerCase() === 'pending') {
        acceptBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        
        // Add event listeners
        acceptBtn.onclick = () => updateOrderStatus(order.orderID, 'processing');
        cancelBtn.onclick = () => updateOrderStatus(order.orderID, 'cancelled');
    } else {
        acceptBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    }

    const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    orderDetailsModal.show();
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    try {
        const allOrders = getAllOrders();
        const order = allOrders.find(o => o.orderID === orderId);
        
        if (!order) {
            showToast('Order not found');
            return;
        }

        // Find the original order in localStorage
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.endsWith('_orders')) {
                const orders = JSON.parse(localStorage.getItem(key)) || [];
                const orderIndex = orders.findIndex(o => o.orderID === orderId);
                
                if (orderIndex !== -1) {
                    // Update the order status
                    orders[orderIndex].status = newStatus;
                    localStorage.setItem(key, JSON.stringify(orders));
                    
                    // Show success message
                    showToast(`Order ${orderId} has been ${newStatus}`);
                    
                    // Close the modal if it's open
                    const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
                    if (modal) {
                        modal.hide();
                    }
                    
                    // Refresh the orders display
                    displayAllOrders();
                    return;
                }
            }
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Error updating order status');
    }
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

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 