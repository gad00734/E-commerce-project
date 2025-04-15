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
    return !!getCurrentUserId();
}

// Function to return wishlist products and display them
function returnWishListProducts() {
    const wishlistKey = getUserStorageKey('wishlist');
    const wishlist = (JSON.parse(localStorage.getItem(wishlistKey)) || []).filter(p => p && p.id && (p.title || p.name) && p.image);
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist)); // Optional cleanup
    const wishlistItemsContainer = document.getElementById('wishlistItems');
    wishlistItemsContainer.innerHTML = ''; // Clear previous wishlist items

    if (wishlist.length === 0) {
        wishlistItemsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-heart" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3">Your wishlist is empty</p>
                <a href="index.html" class="btn btn-primary mt-2">Continue Shopping</a>
            </div>
        `;
        return;
    }

    wishlist.forEach((product, index) => {
        const productHTML = `
            <div class="col-md-4 wishlistItem" data-name="${product.title || product.name}">
                <div class="wishlistCard">
                    <img src="${product.image}" class="productImg" alt="${product.title || product.name}" onerror="this.src='images/placeholder.jpg'">
                    <div class="cardBody">
                        <h5>${product.title || product.name}</h5>
                        <p class="text-muted">$${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btnAdd add-to-cart" onclick="addToCart(${product.id})">
                                <i class="bi bi-cart-plus"></i> Add to Cart
                            </button>
                            <button class="btn btnRemove remove-item" onclick="removeFromWishList(${index})">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        wishlistItemsContainer.insertAdjacentHTML('beforeend', productHTML);
    });

    // Update wishlist count
    updateWishlistCount();
}

// Function to add product to cart
function addToCart(productId) {
    const wishlistKey = getUserStorageKey('wishlist');
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    const product = wishlist.find(p => p.id === productId);

    if (!product) return; // If product is not found, exit

    const cartKey = getUserStorageKey('cart');
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const productIndex = cart.findIndex(p => p.id === productId);

    if (productIndex !== -1) {
        cart[productIndex].quantity += 1; // Update quantity if product already in cart
    } else {
        product.quantity = 1; // Add quantity for new product
        cart.push(product);
    }

    localStorage.setItem(cartKey, JSON.stringify(cart)); // Save to localStorage

    // Show toast for adding product to cart
    showToast("Product added to cart successfully!");

    // Update cart badge count
    document.getElementById('cartBadgeCount').textContent = cart.length;
}

// Function to remove product from wishlist
function removeFromWishList(index) {
    const wishlistKey = getUserStorageKey('wishlist');
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    wishlist.splice(index, 1); // Remove product from wishlist
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist)); // Save to localStorage
    returnWishListProducts(); // Re-render wishlist
    showToast("Product removed from wishlist");
}

// Function to update wishlist count
function updateWishlistCount() {
    const wishlistKey = getUserStorageKey('wishlist');
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

// Show toast notification
function showToast(message) {
    const toastAdd = document.getElementById('toastAdd');
    if (toastAdd) {
        const toastBody = toastAdd.querySelector('.toast-body');
        if (toastBody) {
            toastBody.textContent = message;
        }
        const toast = new bootstrap.Toast(toastAdd);
        toast.show();
    }
}

// Initialize wishlist and cart counts on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!isUserLoggedIn()) {
        showToast('Please log in to view your wishlist');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    returnWishListProducts(); // Display wishlist products
    
    // Update cart count
    const cartKey = getUserStorageKey('cart');
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    document.getElementById('cartBadgeCount').textContent = cart.length;

    // Setup search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const wishlistItems = document.querySelectorAll('.wishlistItem');
            
            wishlistItems.forEach(item => {
                const productName = item.dataset.name.toLowerCase();
                if (productName.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
});
