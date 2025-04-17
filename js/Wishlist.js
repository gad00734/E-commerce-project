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
            showToast('Please log in to view your wishlist', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        // Get current products for stock information
        const currentProducts = JSON.parse(localStorage.getItem('products')) || [];
        
        const wishlistKey = getUserStorageKey('wishlist');
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        
        // Update wishlist items with current stock information
        wishlist = wishlist.map(wishlistItem => {
            const currentProduct = currentProducts.find(p => p.id === wishlistItem.id);
            return {
                ...wishlistItem,
                stock: currentProduct ? currentProduct.stock : 0
            };
        });

        // Save updated wishlist back to storage
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
            const inStock = product.stock > 0;
            const stockStatus = !inStock ? '<span class="badge bg-danger">Out of Stock</span>' : '';
            
            return `
                <div class="col-md-3 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${product.image}" class="card-img-top" 
                             alt="${product.name}" 
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='images/placeholder.jpg'">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text text-muted">$${parseFloat(product.price).toFixed(2)}</p>
                            <p class="mb-2">${stockStatus}</p>
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
                const itemId = this.dataset.id;
                const product = wishlist.find(p => p.id.toString() === itemId);
                if (product) {
                    addToCartFromWishlist(product);
                }
            });
        });

        document.querySelectorAll('.remove-from-wishlist-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.id;
                removeFromWishlist(itemId);
            });
        });

        updateWishlistCount();
    } catch (error) {
        console.error('Error displaying wishlist:', error);
        showToast('Failed to load wishlist. Please try again.', 'danger');
    }
}

// Function to remove product from wishlist
function removeFromWishlist(productId) {
    try {
        const wishlistKey = getUserStorageKey('wishlist');
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        
        // Remove the item
        wishlist = wishlist.filter(item => item.id.toString() !== productId.toString());
        
        // Save updated wishlist
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        
        // Show success message
        showToast('Item removed from wishlist', 'success');
        
        // Refresh the display
        returnWishListProducts();
        
        // Update counts
        updateWishlistCount();
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showToast('Failed to remove item. Please try again.', 'danger');
    }
}

// Function to update wishlist count
function updateWishlistCount() {
    try {
        const wishlistKey = getUserStorageKey('wishlist');
        const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        const count = wishlist.length.toString();

        // Update all possible wishlist count elements
        const wishlistCountElements = document.querySelectorAll('[id^="wishlist"]');
        wishlistCountElements.forEach(element => {
            if (element && element.id.toLowerCase().includes('count')) {
                element.textContent = count;
            }
        });
    } catch (error) {
        console.warn('Error updating wishlist count:', error);
    }
}

// Function to update cart count
function updateCartCount() {
    try {
        if (!isUserLoggedIn()) return;
        
        const cartKey = getUserStorageKey('cart');
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        
        // Update all possible cart count elements
        const cartElements = {
            'cart-count': totalItems.toString(),
            'cartCount': `${totalItems} item${totalItems !== 1 ? 's' : ''}`,
            'cartBadgeCount': totalItems.toString()
        };
        
        Object.entries(cartElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update any cart badges in the navbar
        const navCartBadges = document.querySelectorAll('.cart-badge');
        navCartBadges.forEach(badge => {
            if (badge) {
                badge.textContent = totalItems.toString();
            }
        });
    } catch (error) {
        console.warn('Error updating cart count:', error);
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    try {
        const toast = document.getElementById('toast');
        if (toast) {
            const toastBody = toast.querySelector('.toast-body');
            if (toastBody) {
                toastBody.textContent = message;
                toast.classList.remove('text-bg-success', 'text-bg-danger');
                toast.classList.add(`text-bg-${type}`);
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
            }
        }
    } catch (error) {
        console.warn('Error showing toast:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
            showToast('Please log in to view your wishlist', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        // Initialize components
        await Promise.all([
            returnWishListProducts(),
            initializeSearch(),
            updateCartCount(),
            updateWishlistCount()
        ]);

        // Update navbar
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.username) {
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = loggedInUser.username;
            }
        }

        // Show success message
        showToast('Wishlist loaded successfully', 'success');
    } catch (error) {
        console.error('Error initializing wishlist page:', error);
        showToast('Error loading wishlist. Please try again.', 'danger');
    }
});

// Complete the search initialization function
function initializeSearch() {
    const searchInput = document.querySelector('#searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(function() {
        const searchTerm = this.value.toLowerCase().trim();
        const wishlistItems = document.querySelectorAll('#wishlistItems .col-md-3');
        
        wishlistItems.forEach(item => {
            const card = item.querySelector('.card');
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const price = card.querySelector('.card-text').textContent.toLowerCase();
            const shouldShow = title.includes(searchTerm) || 
                             price.includes(searchTerm);
            item.style.display = shouldShow ? 'block' : 'none';
        });

        // Show "no results" message if no items are visible
        const visibleItems = document.querySelectorAll('#wishlistItems .col-md-3[style="display: block"]');
        const wishlistContainer = document.getElementById('wishlistItems');
        
        if (visibleItems.length === 0 && searchTerm !== '') {
            const noResults = document.createElement('div');
            noResults.className = 'col-12 text-center py-4';
            noResults.id = 'no-results';
            noResults.innerHTML = `
                <h4>No items found matching "${searchTerm}"</h4>
                <p class="text-muted">Try adjusting your search terms</p>
            `;
            
            // Remove existing no results message if it exists
            const existingNoResults = document.getElementById('no-results');
            if (existingNoResults) {
                existingNoResults.remove();
            }
            
            wishlistContainer.appendChild(noResults);
        } else {
            const existingNoResults = document.getElementById('no-results');
            if (existingNoResults) {
                existingNoResults.remove();
            }
        }
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

// Function to add to cart from wishlist
async function addToCartFromWishlist(product) {
    try {
        if (!product || !product.id) {
            showToast('Invalid product data');
            return;
        }

        // Get current cart
        const cartKey = getUserStorageKey('cart');
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        
        // Check if product is already in cart
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            // Increment quantity if in stock
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
                showToast('Item quantity updated in cart');
            } else {
                showToast('Maximum stock limit reached');
                return;
            }
        } else {
            // Add new item to cart
            cart.push({
                ...product,
                quantity: 1
            });
            showToast('Item added to cart');
        }
        
        // Save updated cart
        localStorage.setItem(cartKey, JSON.stringify(cart));
        
        // Remove from wishlist
        removeFromWishlist(product.id);
        
        // Update counts
        updateCartCount();
        updateWishlistCount();
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add item to cart');
    }
}
