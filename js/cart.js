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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (!isUserLoggedIn()) {
        showToast('Please log in to view your cart');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    displayCartItems();
    updateWishlistCount();
});

// Display cart items from localStorage
function displayCartItems() {
    if (!isUserLoggedIn()) return;

    const cartItemsContainer = document.getElementById('cartItems');
    const totalPriceElem = document.getElementById('totalPrice');
    const subtotalElem = document.getElementById('subtotal');
    const shippingElem = document.getElementById('shipping');
    const totalItemsElem = document.getElementById('totalItems');
    const cartCountElem = document.getElementById('cartCount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');
    
    const cartKey = getUserStorageKey('cart');
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    const shipping = 5.00; // Fixed shipping cost
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3">Your cart is empty</p>
                <a href="index.html" class="btn btn-primary mt-2">Continue Shopping</a>
            </div>
        `;
        totalItemsElem.textContent = '0';
        cartCountElem.textContent = '0 items';
        subtotalElem.textContent = '$0.00';
        shippingElem.textContent = '$0.00';
        totalPriceElem.textContent = '$0.00';
        checkoutBtn.disabled = true;
        clearCartBtn.disabled = true;
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.classList.add('card', 'mb-3');
        cartItem.innerHTML = `
            <div class="row g-0 align-items-center p-2">
                <div class="col-md-2">
                    <img src="${item.image}" class="img-fluid rounded" alt="${item.name}"
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="col-md-7">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text text-muted mb-1">Price: $${item.price.toFixed(2)}</p>
                        <p class="card-text text-muted mb-1">Available in stock: ${item.stock}</p>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 'decrease')">
                                <i class="bi bi-dash"></i>
                            </button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 'increase')"
                                    ${item.quantity >= item.stock ? 'disabled' : ''}>
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 text-end">
                    <p class="h5 text-success mb-3">$${itemTotal.toFixed(2)}</p>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">
                        <i class="bi bi-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = subtotal + shipping;

    totalItemsElem.textContent = totalItems;
    cartCountElem.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    subtotalElem.textContent = `$${subtotal.toFixed(2)}`;
    shippingElem.textContent = `$${shipping.toFixed(2)}`;
    totalPriceElem.textContent = `$${total.toFixed(2)}`;
    checkoutBtn.disabled = false;
    clearCartBtn.disabled = false;
}

// Update item quantity
function updateQuantity(productId, action) {
    if (!isUserLoggedIn()) return;

    const cartKey = getUserStorageKey('cart');
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (action === 'increase') {
            if (item.quantity + 1 > item.stock) {
                showToast(`Sorry, only ${item.stock} items available in stock!`);
                return;
            }
            item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
        }
        
        localStorage.setItem(cartKey, JSON.stringify(cart));
        displayCartItems();
        showToast(`Updated ${item.name} quantity`);
    }
}

// Remove item from cart
function removeFromCart(productId) {
    if (!isUserLoggedIn()) return;

    const cartKey = getUserStorageKey('cart');
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        displayCartItems();
        showToast(`Removed ${item.name} from cart`);
    }
}

// Clear all items from cart
function clearCart() {
    if (!isUserLoggedIn()) return;

    if (confirm('Are you sure you want to clear your cart?')) {
        const cartKey = getUserStorageKey('cart');
        localStorage.removeItem(cartKey);
        displayCartItems();
        showToast('Cart cleared');
    }
}

// Process checkout and create order
function addOrder() {
    if (!isUserLoggedIn()) {
        showToast('Please log in to checkout');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const cartKey = getUserStorageKey('cart');
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5.00;
    const total = subtotal + shipping;

    // Create order data
    const orderData = {
        orderID: 'ORD' + Date.now(),
        userID: getCurrentUserId(),
        date: new Date().toLocaleDateString(),
        items: cart,
        subtotal: subtotal,
        shipping: shipping,
        totalPrice: total,
        status: 'Processing'
    };

    // Save order
    const ordersKey = getUserStorageKey('orders');
    let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    orders.push(orderData);
    localStorage.setItem(ordersKey, JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem(cartKey);
    
    // Show success message
    showToast('Order placed successfully!');
    
    // Redirect to orders page after a short delay
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 1500);
}

// Update wishlist counter
function updateWishlistCount() {
    if (!isUserLoggedIn()) return;

    const wishlistKey = getUserStorageKey('wishlist');
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
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