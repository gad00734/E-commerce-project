// Check if user is logged in and has admin privileges
function checkAdminAuth() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || loggedInUser.role !== 'admin') {
        window.location.href = 'index.html';
    }
    document.getElementById('adminName').textContent = loggedInUser.email || 'Admin';
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

// Update dashboard statistics
async function updateDashboardStats() {
    try {
        // Get products count
        const products = JSON.parse(localStorage.getItem('products')) || [];
        document.getElementById('productCount').textContent = products.length;

        // Get categories count
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        document.getElementById('categoryCount').textContent = categories.length;

        // Get all orders and calculate revenue
        const orders = getAllOrders();
        document.getElementById('orderCount').textContent = orders.length;

        // Calculate total revenue only from delivered orders
        const totalRevenue = orders
            .filter(order => order.status.toLowerCase() === 'delivered')
            .reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0);
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;

        // Update recent orders table
        updateRecentOrders(orders);
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        showToast('Error loading dashboard statistics');
    }
}

// Update recent orders table
function updateRecentOrders(orders) {
    const recentOrdersTable = document.getElementById('recentOrdersTable');
    if (!recentOrdersTable) return;

    recentOrdersTable.innerHTML = '';

    // Sort orders by date (most recent first) and get last 5
    const recentOrders = orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    if (recentOrders.length === 0) {
        recentOrdersTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No orders found</td>
            </tr>
        `;
        return;
    }

    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        const orderDate = new Date(order.date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        row.innerHTML = `
            <td>${order.orderID}</td>
            <td>${orderDate}</td>
            <td>${order.userId || 'Guest'}</td>
            <td>$${parseFloat(order.totalPrice).toFixed(2)}</td>
            <td>
                <span class="badge bg-${getStatusBadgeClass(order.status)}">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </td>
        `;
        recentOrdersTable.appendChild(row);
    });
}

// Get status badge color
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
    const toastEl = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastEl);
    document.getElementById('toast-message').textContent = message;
    toast.show();
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
});

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    updateDashboardStats();
});

// Refresh dashboard stats every 30 seconds
setInterval(updateDashboardStats, 30000);

// Check if user is admin
function isAdmin() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    return loggedInUser && loggedInUser.role === 'admin';
} 