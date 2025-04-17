// Base configuration
const config = {
    storageKeys: {
        user: 'loggedInUser',
        cart: 'cart',
        wishlist: 'wishlist',
        products: 'products',
        categories: 'categories',
        orders: 'orders'
    },
    urls: {
        home: 'index.html',
        login: 'Login.html',
        register: 'Register.html',
        shop: 'shop.html',
        cart: 'cart.html',
        wishlist: 'Wishlist.html',
        orders: 'orders.html',
        profile: 'profile.html',
        admin: {
            dashboard: 'admin-panel.html',
            products: 'admin-products.html',
            categories: 'admin-categories.html',
            orders: 'admin-orders.html',
            users: 'admin-users.html'
        }
    }
};

// User authentication and management
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(config.storageKeys.user));
}

function isUserLoggedIn() {
    return getCurrentUser() !== null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function getUserStorageKey(key) {
    const userId = getCurrentUser()?.id;
    return userId ? `${userId}_${key}` : key;
}

// Navigation guards
function requireAuth(redirectUrl = config.urls.login) {
    if (!isUserLoggedIn()) {
        showToast('Please log in to continue');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
        return false;
    }
    return true;
}

function requireAdmin(redirectUrl = config.urls.home) {
    if (!isAdmin()) {
        showToast('Unauthorized access');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
        return false;
    }
    return true;
}

// UI utilities
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast show position-fixed bottom-0 end-0 m-3 bg-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Error handling
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    showToast(`An error occurred${context ? ` while ${context}` : ''}. Please try again.`, 'danger');
}

// Navigation update
function updateNavbar() {
    try {
        const user = getCurrentUser();
        
        // Get all navbar elements
        const elements = {
            login: document.getElementById("nav-login"),
            register: document.getElementById("nav-register"),
            logout: document.getElementById("nav-logout"),
            orders: document.getElementById("nav-orders"),
            wishlist: document.getElementById("nav-wishlist"),
            profile: document.getElementById("nav-profile"),
            admin: document.getElementById("nav-admin"),
            username: document.getElementById("username-display"),
            cartCount: document.getElementById("cart-count")
        };

        if (user) {
            // User is logged in
            elements.login?.style.setProperty('display', 'none');
            elements.register?.style.setProperty('display', 'none');
            elements.logout?.style.setProperty('display', 'block');
            elements.orders?.style.setProperty('display', 'block');
            elements.wishlist?.style.setProperty('display', 'block');
            elements.profile?.style.setProperty('display', 'block');
            
            // Show admin link if user is admin
            if (elements.admin) {
                elements.admin.style.display = user.role === 'admin' ? 'block' : 'none';
            }

            // Update username display
            if (elements.username) {
                const displayName = user.username || user.name || 'User';
                elements.username.textContent = displayName;
            }

            // Update counters
            updateCartCount();
            updateWishlistCount();
        } else {
            // User is not logged in
            elements.login?.style.setProperty('display', 'block');
            elements.register?.style.setProperty('display', 'block');
            elements.logout?.style.setProperty('display', 'none');
            elements.orders?.style.setProperty('display', 'none');
            elements.wishlist?.style.setProperty('display', 'none');
            elements.profile?.style.setProperty('display', 'none');
            elements.admin?.style.setProperty('display', 'none');
            
            if (elements.username) {
                elements.username.textContent = 'Guest';
            }
            if (elements.cartCount) {
                elements.cartCount.textContent = '0';
            }
        }
    } catch (error) {
        handleError(error, 'updating navigation');
    }
}

// Counter updates
function updateCartCount() {
    try {
        if (!isUserLoggedIn()) return;
        
        const cartKey = getUserStorageKey(config.storageKeys.cart);
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        const elements = [
            document.getElementById('cart-count'),
            document.getElementById('cartCount'),
            document.getElementById('cartBadgeCount')
        ];
        
        elements.forEach(element => {
            if (element) {
                if (element.id === 'cartCount') {
                    element.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
                } else {
                    element.textContent = totalItems.toString();
                }
            }
        });
    } catch (error) {
        handleError(error, 'updating cart count');
    }
}

function updateWishlistCount() {
    try {
        if (!isUserLoggedIn()) return;
        
        const wishlistKey = getUserStorageKey(config.storageKeys.wishlist);
        const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        
        const wishlistCount = document.getElementById('wishlistCount');
        if (wishlistCount) {
            wishlistCount.textContent = wishlist.length.toString();
        }
    } catch (error) {
        handleError(error, 'updating wishlist count');
    }
}

// Initialize page
function initializePage(options = {}) {
    const { requiresAuth = false, requiresAdmin = false, onLoad } = options;
    
    document.addEventListener('DOMContentLoaded', () => {
        try {
            // Check authentication if required
            if (requiresAuth && !requireAuth()) return;
            if (requiresAdmin && !requireAdmin()) return;
            
            // Update navigation
            updateNavbar();
            
            // Call page-specific initialization if provided
            if (onLoad) onLoad();
            
        } catch (error) {
            handleError(error, 'initializing page');
        }
    });
}

// Export all functions
window.config = config;
window.getCurrentUser = getCurrentUser;
window.isUserLoggedIn = isUserLoggedIn;
window.isAdmin = isAdmin;
window.getUserStorageKey = getUserStorageKey;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
window.showToast = showToast;
window.handleError = handleError;
window.updateNavbar = updateNavbar;
window.updateCartCount = updateCartCount;
window.updateWishlistCount = updateWishlistCount;
window.initializePage = initializePage; 