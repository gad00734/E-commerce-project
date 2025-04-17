// Configuration object
const config = {
    storageKeys: {
        products: 'products',
        categories: 'categories',
        cart: 'cart',
        wishlist: 'wishlist',
        orders: 'orders'
    },
    urls: {
        login: 'login.html',
        shop: 'shop.html',
        cart: 'cart.html',
        orders: 'orders.html'
    }
};

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

// Check if user is logged in
function isUserLoggedIn() {
    return getCurrentUserId() !== null;
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

// Update cart counter
function updateCartCount() {
    if (!isUserLoggedIn()) return;
    
    const cartKey = getUserStorageKey(config.storageKeys.cart);
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    
    // Update all possible cart count elements
    const cartCountElements = [
        document.getElementById('cart-count'),
        document.getElementById('cartCount'),
        document.getElementById('cartBadgeCount')
    ];
    
    cartCountElements.forEach(element => {
        if (element) {
            if (element.id === 'cartCount') {
                element.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
            } else {
                element.textContent = totalItems.toString();
            }
        }
    });

    // Update the cart badge in the navbar if it exists
    const navCartBadge = document.querySelector('.cart-badge');
    if (navCartBadge) {
        navCartBadge.textContent = totalItems.toString();
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (!isUserLoggedIn()) {
        showToast('Please log in to view your cart');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    updateNavbar();
    displayCartItems();
    updateWishlistCount();
});

// Function to display cart items
function displayCartItems() {
    try {
        if (!isUserLoggedIn()) {
            showToast('Please log in to view your cart', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        const cartKey = getUserStorageKey('cart');
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const cartContainer = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');

        if (!cartContainer) return;

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-5">
                    <div class="empty-cart">
                        <h3>Your cart is empty</h3>
                        <p class="text-muted">Add items to your cart to proceed with checkout.</p>
                        <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
                    </div>
                </div>`;
            
            if (cartSummary) {
                cartSummary.style.display = 'none';
            }
            return;
        }

        // Show cart summary if it exists
        if (cartSummary) {
            cartSummary.style.display = 'block';
        }

        // Get current products for stock validation
        const products = JSON.parse(localStorage.getItem('products')) || [];

        cartContainer.innerHTML = cart.map(item => {
            const currentProduct = products.find(p => p.id === item.id);
            const inStock = currentProduct && currentProduct.stock > 0;
            const stockStatus = !inStock ? '<span class="badge bg-danger">Out of Stock</span>' : '';
            const maxQuantity = currentProduct ? currentProduct.stock : 0;

            return `
                <div class="card mb-3 cart-item" data-id="${item.id}">
                    <div class="row g-0">
                        <div class="col-md-2">
                            <img src="${item.image || 'images/placeholder.jpg'}" 
                                 class="img-fluid rounded-start" 
                                 alt="${item.name}"
                                 style="height: 150px; object-fit: cover;"
                                 onerror="this.src='images/placeholder.jpg'">
                        </div>
                        <div class="col-md-10">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h5 class="card-title">${item.name}</h5>
                                        <p class="card-text">
                                            <small class="text-muted">Price: $${parseFloat(item.price).toFixed(2)}</small>
                                        </p>
                                        ${stockStatus}
                                    </div>
                                    <div class="col-md-4">
                                        <div class="quantity-controls">
                                            <button class="btn btn-outline-secondary btn-sm quantity-btn" 
                                                    onclick="updateQuantity(${item.id}, -1)"
                                                    ${!inStock ? 'disabled' : ''}>
                                                <i class="bi bi-dash"></i>
                                            </button>
                                            <span class="quantity mx-2">${item.quantity}</span>
                                            <button class="btn btn-outline-secondary btn-sm quantity-btn" 
                                                    onclick="updateQuantity(${item.id}, 1)"
                                                    ${!inStock || item.quantity >= maxQuantity ? 'disabled' : ''}>
                                                <i class="bi bi-plus"></i>
                                            </button>
                                        </div>
                                        <p class="subtotal mt-2">
                                            Subtotal: $${(item.quantity * item.price).toFixed(2)}
                                        </p>
                                    </div>
                                    <div class="col-md-2 text-end">
                                        <button class="btn btn-outline-danger btn-sm remove-btn" 
                                                onclick="removeFromCart(${item.id})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        updateCartTotal();
        updateCartCount();

    } catch (error) {
        console.error('Error displaying cart items:', error);
        showToast('Error loading cart items', 'danger');
    }
}

// Function to update quantity
function updateQuantity(productId, change) {
    try {
        const cartKey = getUserStorageKey('cart');
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        // Convert IDs to strings for comparison
        const stringId = String(productId);
        const cartItem = cart.find(item => String(item.id) === stringId);
        const currentProduct = products.find(p => String(p.id) === stringId);
        
        if (!cartItem || !currentProduct) {
            console.error('Product not found:', stringId);
            showToast('Error updating quantity', 'danger');
            return;
        }

        const newQuantity = parseInt(cartItem.quantity) + change;
        
        // Validate new quantity
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (newQuantity > currentProduct.stock) {
            showToast('Maximum stock limit reached', 'warning');
            return;
        }

        cartItem.quantity = newQuantity;
        localStorage.setItem(cartKey, JSON.stringify(cart));
        
        displayCartItems();
        updateCartTotal();
        updateCartCount();
        showToast('Cart updated successfully', 'success');
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast('Error updating quantity', 'danger');
    }
}

// Remove item from cart
function removeFromCart(productId) {
    try {
        if (!isUserLoggedIn()) return;

        const cartKey = getUserStorageKey(config.storageKeys.cart);
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        
        // Convert productId to string for consistent comparison
        const searchId = String(productId);
        
        // Find the item using string comparison
        const item = cart.find(item => String(item.id) === searchId);
        
        if (item) {
            // Filter out the item using string comparison
            cart = cart.filter(item => String(item.id) !== searchId);
            localStorage.setItem(cartKey, JSON.stringify(cart));
            displayCartItems();
            showToast(`Removed ${item.name} from cart`);
        } else {
            console.error('Item not found in cart:', searchId);
            showToast('Error removing item from cart');
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        showToast('Error removing item from cart');
    }
}

// Clear all items from cart
function clearCart() {
    if (!isUserLoggedIn()) return;

    if (confirm('Are you sure you want to clear your cart?')) {
        const cartKey = getUserStorageKey(config.storageKeys.cart);
        localStorage.removeItem(cartKey);
        displayCartItems();
        showToast('Cart cleared');
    }
}

// Dummy checkout simulation
function addOrder() {
    if (!isUserLoggedIn()) {
        showToast('Please log in to checkout');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // Get the cart data using user-specific key
    const cartKey = getUserStorageKey(config.storageKeys.cart);
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    if (!cart || cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }

    // Calculate subtotal and shipping
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5.00; // Fixed shipping cost
    const totalPrice = (subtotal + shipping).toFixed(2);

    // Generate a dummy order ID
    const orderID = '#100' + Math.floor(Math.random() * 1000);

    // Create order data
    const orderData = {
        orderID: orderID,
        date: new Date().toLocaleDateString(),
        items: cart,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        totalPrice: totalPrice,
        status: 'Pending'
    };

    // Store the order data in localStorage using user-specific key
    const ordersKey = getUserStorageKey(config.storageKeys.orders);
    let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    orders.push(orderData);
    localStorage.setItem(ordersKey, JSON.stringify(orders));

    // Clear the cart data after placing the order
    localStorage.removeItem(cartKey);
    displayCartItems();

    // Redirect to the orders page
    window.location.href = 'orders.html';
}

// Update wishlist counter
function updateWishlistCount() {
    if (!isUserLoggedIn()) return;

    const wishlistKey = getUserStorageKey(config.storageKeys.wishlist);
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    try {
        const toast = document.getElementById('liveToast');
        if (toast) {
            const toastBody = document.getElementById('toast-message');
            if (toastBody) {
                toastBody.textContent = message;
                
                // Remove existing color classes
                toast.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
                
                // Add appropriate color class
                switch (type) {
                    case 'success':
                        toast.classList.add('bg-success');
                        break;
                    case 'danger':
                        toast.classList.add('bg-danger');
                        break;
                    case 'warning':
                        toast.classList.add('bg-warning');
                        break;
                    case 'info':
                        toast.classList.add('bg-info');
                        break;
                }
                
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
            }
        }
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

// Search cart items
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cartItems = document.querySelectorAll('#cartItems .card');
    
    cartItems.forEach(item => {
        const title = item.querySelector('.card-title').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});

// Add event listener for checkout button
document.getElementById('checkoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    addOrder();
});

// Calculate and update cart total
function updateCartTotal() {
    try {
        const cartKey = getUserStorageKey(config.storageKeys.cart);
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        
        // Get elements
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const totalElement = document.getElementById('totalPrice');
        
        if (!subtotalElement || !shippingElement || !totalElement) {
            console.error('Required elements not found for cart total update');
            return;
        }

        // Calculate subtotal
        const subtotal = cart.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);

        // Fixed shipping cost
        const shipping = cart.length > 0 ? 5.00 : 0;

        // Calculate total
        const total = subtotal + shipping;

        // Update display
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        shippingElement.textContent = `$${shipping.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;

        // Show/hide cart summary
        const cartSummary = document.getElementById('cartSummary');
        if (cartSummary) {
            cartSummary.style.display = cart.length > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error updating cart total:', error);
        showToast('Error updating cart total', 'danger');
    }
}