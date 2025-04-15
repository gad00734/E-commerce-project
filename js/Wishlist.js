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
async function returnWishListProducts() {
    try {
        if (!isUserLoggedIn()) {
            showToast('Please log in to view your wishlist');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        // Get current products with fallback
        const currentProducts = await fetchProductsWithFallback();
        
        const wishlistKey = getUserStorageKey('wishlist');
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        
        // Filter out invalid entries and update with current stock information
        wishlist = wishlist.filter(product => {
            if (!product || !product.id) return false;
            
            // Update product with current stock information
            const currentProduct = currentProducts.find(p => p.id === product.id);
            if (currentProduct) {
                product.quantity = parseInt(currentProduct.quantity) || 0;
                product.stock = product.quantity;
                return true;
            }
            // Keep the product in wishlist even if not found in current products
            product.quantity = 0;
            product.stock = 0;
            return true;
        });

        // Save the cleaned wishlist back to storage
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));

        const wishlistItems = document.getElementById('wishlistItems');
        if (!wishlistItems) return;

        if (wishlist.length === 0) {
            wishlistItems.innerHTML = `
                <div class="col-12 text-center">
                    <div class="empty-wishlist">
                        <h3>Your wishlist is empty</h3>
                        <p class="text-muted">Add items to your wishlist to save them for later.</p>
                        <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
                    </div>
                </div>`;
            updateWishlistCount();
            return;
        }

        wishlistItems.innerHTML = wishlist.map(product => {
            const inStock = parseInt(product.quantity) > 0;
            return `
                <div class="col-md-3 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${product.image}" class="card-img-top" 
                             alt="${product.name || product.title}" 
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='images/placeholder.jpg'">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name || product.title}</h5>
                            <p class="card-text text-muted">$${parseFloat(product.price).toFixed(2)}</p>
                            <p class="mb-2">
                                ${inStock 
                                    ? `<span class="badge bg-success">In Stock (${product.quantity})</span>`
                                    : '<span class="badge bg-danger">Out of Stock</span>'
                                }
                            </p>
                            <div class="mt-auto d-flex gap-2">
                                <button class="btn btn-primary flex-grow-1 add-to-cart-btn" 
                                        data-id="${product.id}"
                                        ${!inStock ? 'disabled' : ''}>
                                    ${inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                <button class="btn btn-outline-danger remove-from-wishlist-btn"
                                        data-id="${product.id}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.dataset.id);
                const product = wishlist.find(p => p.id === itemId);
                if (product) {
                    window.addToCart(product);
                    removeFromWishlist(itemId);
                }
            });
        });

        document.querySelectorAll('.remove-from-wishlist-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.dataset.id);
                removeFromWishlist(itemId);
            });
        });

        updateWishlistCount();
    } catch (error) {
        console.error('Error displaying wishlist:', error);
        showToast('Failed to load wishlist. Please try again.');
    }
}

// Function to remove product from wishlist
function removeFromWishlist(productId) {
    try {
        const wishlistKey = getUserStorageKey('wishlist');
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        wishlist = wishlist.filter(item => item && item.id !== productId);
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        showToast('Item removed from wishlist');
        returnWishListProducts();
        updateWishlistCount();
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showToast('Failed to remove item. Please try again.');
    }
}

// Function to update wishlist count
function updateWishlistCount() {
    const wishlistKey = getUserStorageKey('wishlist');
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

// Function to update cart count
function updateCartCount() {
    if (!isUserLoggedIn()) return;
    
    const cartKey = getUserStorageKey('cart');
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
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
                element.textContent = totalItems;
            }
        }
    });
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    returnWishListProducts();
    initializeSearch();
});

// Complete the search initialization function
function initializeSearch() {
    const searchInput = document.querySelector('#wishlist-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(function() {
        const searchTerm = this.value.toLowerCase().trim();
        const wishlistItems = document.querySelectorAll('#wishlistItems .card');
        
        wishlistItems.forEach(item => {
            const title = item.querySelector('.card-title').textContent.toLowerCase();
            const shouldShow = title.includes(searchTerm);
            item.closest('.col-md-3').style.display = shouldShow ? 'block' : 'none';
        });
    }, 300));
}

// Debounce function to limit how often the search is performed
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Function to handle server connection errors
async function fetchProductsWithFallback() {
    try {
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) throw new Error('Server response was not ok');
        return await response.json();
    } catch (error) {
        console.warn('Failed to fetch from server, using cached data:', error);
        // Return empty array if no products can be fetched
        return [];
    }
}
