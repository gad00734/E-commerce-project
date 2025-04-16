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
    const cartKey = getUserStorageKey('cart');
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update both the navbar cart count and the cart page count
    const cartCount = document.getElementById('cart-count');
    const cartCountBadge = document.getElementById('cartCount');
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    if (cartCountBadge) {
        cartCountBadge.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
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

// Display cart items from localStorage
async function displayCartItems() {
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
    
    // Try to fetch current stock from server
    let currentProducts = [];
    try {
        const response = await fetch('http://localhost:3000/products');
        if (response.ok) {
            currentProducts = await response.json();
            
            // Update cart with current stock information
            cart = cart.filter(item => {
                const currentProduct = currentProducts.find(p => p.id === item.id);
                if (!currentProduct) {
                    console.warn(`${item.name} is no longer available`);
                    return true; // Keep item in cart but mark as unavailable
                }
                if (currentProduct.quantity === 0) {
                    console.warn(`${item.name} is out of stock`);
                    item.stock = 0;
                    return true;
                }
                if (item.quantity > currentProduct.quantity) {
                    item.quantity = currentProduct.quantity;
                    console.warn(`${item.name} quantity adjusted to ${currentProduct.quantity}`);
                }
                item.stock = currentProduct.quantity;
                return true;
            });
        } else {
            console.warn('Server returned error status');
        }
    } catch (error) {
        console.warn('Could not fetch current stock, using cached data:', error);
    }
    
    // Always proceed with displaying cart items, even if server request failed
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
                        <p class="card-text text-muted mb-1">
                            ${item.stock !== undefined ? `Available in stock: ${item.stock}` : 'Stock information unavailable'}
                        </p>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 'decrease')">
                                <i class="bi bi-dash"></i>
                            </button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 'increase')"
                                    ${item.stock !== undefined && item.quantity >= item.stock ? 'disabled' : ''}>
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
    
    // Save any updates back to localStorage
    localStorage.setItem(cartKey, JSON.stringify(cart));
}

// Update item quantity
async function updateQuantity(productId, action) {
    if (!isUserLoggedIn()) return;

    try {
        // Get current stock from server
        const response = await fetch('http://localhost:3000/products');
        const products = await response.json();
        const currentProduct = products.find(p => p.id === productId);
        
        if (!currentProduct) {
            showToast('Product no longer available');
            return;
        }

        const cartKey = getUserStorageKey('cart');
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            if (action === 'increase') {
                if (item.quantity + 1 > currentProduct.quantity) {
                    showToast(`Sorry, only ${currentProduct.quantity} items available in stock!`);
                    return;
                }
                item.quantity += 1;
            } else if (action === 'decrease' && item.quantity > 1) {
                item.quantity -= 1;
            }
            
            // Update stock information
            item.stock = currentProduct.quantity;
            
            localStorage.setItem(cartKey, JSON.stringify(cart));
            displayCartItems();
            showToast(`Updated ${item.name} quantity`);
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast('Error updating quantity. Please try again.');
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
    const cartKey = getUserStorageKey('cart');
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
    const ordersKey = getUserStorageKey('orders');
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

// Add event listener for checkout button
document.getElementById('checkoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    addOrder();
});