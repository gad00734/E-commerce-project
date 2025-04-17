document.addEventListener("DOMContentLoaded", () => {
    initializePage();
});

function setupEventListeners() {
    try {
        // Add search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', filterProducts);
        }

        // Add category filter event listener
        const categoryFilter = document.getElementById("categoryFilter");
        if (categoryFilter) {
            categoryFilter.addEventListener("change", filterProducts);
        }
    } catch (error) {
        handleError(error, 'setting up event listeners');
    }
}

async function loadCategoriesToDropdown() {
    try {
        const categories = JSON.parse(localStorage.getItem(config.storageKeys.categories)) || [];
        const dropdown = document.getElementById("categoryFilter");

        if (!dropdown) return;

        // Clear existing options
        dropdown.innerHTML = `
            <option value="all">All Categories</option>
            ${categories.map(cat => `
                <option value="${cat.id}">${cat.name}</option>
            `).join('')}
        `;
    } catch (error) {
        handleError(error, 'loading categories');
    }
}

// Filter products
function filterProducts() {
    try {
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        
        if (!categoryFilter || !searchInput) {
            console.error('Filter elements not found');
            return;
        }

        const categoryId = categoryFilter.value;
        const searchTerm = searchInput.value.toLowerCase().trim();
        const products = JSON.parse(localStorage.getItem(config.storageKeys.products)) || [];
        
        let filteredProducts = products;

        // Filter by category
        if (categoryId && categoryId !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                String(product.category) === String(categoryId)
            );
        }

        // Filter by search term
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }

        console.log('Filtering products:', {
            categoryId,
            searchTerm,
            totalProducts: products.length,
            filteredCount: filteredProducts.length
        });

        renderProducts(filteredProducts);
    } catch (error) {
        console.error('Error filtering products:', error);
        showToast('Error filtering products', 'danger');
    }
}

// Function to render products
function renderProducts(products) {
    try {
        const productList = document.getElementById('product-list');
        if (!productList) {
            throw new Error('Products container not found');
        }

        if (products.length === 0) {
            productList.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">No products found</div>
                </div>
            `;
            return;
        }

        productList.innerHTML = products.map(product => createProductCard(product)).join('');

        // Add event listeners to buttons after rendering
        productList.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                const product = products.find(p => p.id === productId || p.id.toString() === productId);
                if (product) {
                    showProductModal(product);
                }
            });
        });

        productList.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                const product = products.find(p => p.id === productId || p.id.toString() === productId);
                if (product) {
                    addToCart(product);
                }
            });
        });

        productList.querySelectorAll('.add-to-wishlist-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                const product = products.find(p => p.id === productId || p.id.toString() === productId);
                if (product) {
                    addToWishlist(product);
                }
            });
        });

    } catch (error) {
        handleError(error, 'rendering products');
        const productList = document.getElementById('product-list');
        if (productList) {
            productList.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        Error loading products. Please try again later.
                    </div>
                </div>
            `;
        }
    }
}

// Create product card HTML
function createProductCard(product) {
    const inStock = product.stock > 0;
    const stockStatus = !inStock ? '<span class="badge bg-danger">Out of Stock</span>' : '';

    return `
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card h-100 shadow-sm">
                <img src="${product.image || 'images/placeholder.jpg'}" 
                     class="card-img-top" 
                     alt="${product.name}"
                     onerror="this.src='images/placeholder.jpg'"
                     style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted">$${parseFloat(product.price).toFixed(2)}</p>
                    ${stockStatus}
                    <div class="mt-3 d-flex gap-2 justify-content-center">
                        <button type="button" class="btn btn-success btn-sm rounded-pill view-details-btn" 
                                data-id="${product.id}">
                            View Details
                        </button>
                        <button type="button" class="btn btn-success btn-sm rounded-pill add-to-cart-btn" 
                                data-id="${product.id}"
                                ${!inStock ? 'disabled' : ''}>
                            ${inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button type="button" class="btn btn-danger btn-sm rounded-pill add-to-wishlist-btn" 
                                data-id="${product.id}">
                            <i class="bi bi-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show product modal
function showProductModal(product) {
    try {
        const modalTitle = document.getElementById('modal-title');
        const modalPrice = document.getElementById('modal-price');
        const modalStock = document.getElementById('modal-stock');
        const modalDescription = document.getElementById('modal-description');
        const modalImage = document.getElementById('modal-image');

        if (modalTitle) modalTitle.textContent = product.name;
        if (modalPrice) modalPrice.textContent = parseFloat(product.price).toFixed(2);
        if (modalStock) {
            modalStock.textContent = product.stock > 0 
                ? `In Stock (${product.stock} available)` 
                : 'Out of Stock';
            modalStock.className = `mb-3 ${product.stock > 0 ? 'text-success' : 'text-danger'}`;
        }
        if (modalDescription) modalDescription.textContent = product.description || 'No description available';
        if (modalImage) {
            modalImage.src = product.image || 'images/placeholder.jpg';
            modalImage.onerror = () => modalImage.src = 'images/placeholder.jpg';
        }

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    } catch (error) {
        handleError(error, 'showing product details');
    }
}

// Initialize the page
async function initializePage() {
    try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
            window.location.href = config.urls.login;
            return;
        }

        // Load initial data
        await loadCategoriesToDropdown();
        await loadProducts();
        await syncCartWithCurrentStock();
        setupEventListeners();
        updateCartCount();
        updateWishlistCount();
    } catch (error) {
        handleError(error, 'initializing page');
    }
}

// Load products from storage
async function loadProducts() {
    try {
        const products = JSON.parse(localStorage.getItem(config.storageKeys.products)) || [];
        renderProducts(products);
    } catch (error) {
        handleError(error, 'loading products');
    }
}

// Function to show toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('liveToast');
    const toastBody = document.getElementById('toast-message');
    
    if (toast && toastBody) {
        toast.classList.remove('text-bg-success', 'text-bg-danger');
        toast.classList.add(type === 'success' ? 'text-bg-success' : 'text-bg-danger');
        toastBody.textContent = message;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

// Load categories from storage
async function loadCategories() {
    try {
        const categories = JSON.parse(localStorage.getItem(config.storageKeys.categories)) || [];
        const categorySelect = document.getElementById('categoryFilter');
        
        if (!categorySelect) {
            throw new Error('Category filter not found');
        }

        categorySelect.innerHTML = `
            <option value="">All Categories</option>
            ${categories.map(category => `
                <option value="${category.id}">${category.name}</option>
            `).join('')}
        `;

    } catch (error) {
        handleError(error);
    }
}

// Sync cart items with current stock
async function syncCartWithCurrentStock() {
    try {
        const products = JSON.parse(localStorage.getItem(config.storageKeys.products)) || [];
        const cartKey = getUserStorageKey(config.storageKeys.cart);
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        let cartUpdated = false;

        // Update cart items with current stock information
        cart = cart.map(cartItem => {
            const currentProduct = products.find(p => p.id.toString() === cartItem.id.toString());
            if (currentProduct) {
                // If current stock is less than cart quantity, adjust the cart quantity
                if (currentProduct.stock < cartItem.quantity) {
                    cartItem.quantity = currentProduct.stock;
                    cartUpdated = true;
                }
                // Update stock information
                cartItem.stock = currentProduct.stock;
            }
            return cartItem;
        });

        // Remove items with zero stock
        const filteredCart = cart.filter(item => item.stock > 0);
        if (filteredCart.length !== cart.length) {
            cartUpdated = true;
        }

        if (cartUpdated) {
            localStorage.setItem(cartKey, JSON.stringify(filteredCart));
            showToast('Your cart has been updated due to stock changes', 'info');
            updateCartCount();
        }
    } catch (error) {
        console.error('Error syncing cart with stock:', error);
        handleError(error, 'syncing cart with stock');
    }
}

// Function to add to cart
function addToCart(product) {
    try {
        if (!isUserLoggedIn()) {
            showToast('Please log in to add items to cart');
            setTimeout(() => {
                window.location.href = config.urls.login;
            }, 1500);
            return;
        }

        if (!product || !product.id) {
            throw new Error('Invalid product data');
        }

        // Check if product is in stock
        const products = JSON.parse(localStorage.getItem(config.storageKeys.products)) || [];
        const currentProduct = products.find(p => p.id === product.id || p.id.toString() === product.id.toString());
        
        if (!currentProduct || currentProduct.stock <= 0) {
            showToast(`Sorry, ${product.name} is out of stock!`);
            return;
        }

        const cartKey = getUserStorageKey(config.storageKeys.cart);
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const existingProduct = cart.find(item => item.id === product.id || item.id.toString() === product.id.toString());

        if (existingProduct) {
            if (existingProduct.quantity + 1 > currentProduct.stock) {
                showToast(`Sorry, only ${currentProduct.stock} items available in stock!`);
                return;
            }
            existingProduct.quantity += 1;
            existingProduct.stock = currentProduct.stock; // Update stock information
            showToast(`Increased ${product.name} quantity in cart!`);
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                quantity: 1,
                stock: currentProduct.stock
            });
            showToast(`${product.name} added to cart!`);
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
        updateCartCount();
    } catch (error) {
        console.error('Error adding to cart:', error);
        handleError(error, 'adding to cart');
        showToast('Error adding product to cart');
    }
}

// Function to add to wishlist
function addToWishlist(product) {
    try {
        if (!isUserLoggedIn()) {
            showToast('Please log in to add items to wishlist');
            setTimeout(() => {
                window.location.href = config.urls.login;
            }, 1500);
            return;
        }

        if (!product || !product.id) {
            throw new Error('Invalid product data');
        }

        // Get current product data to ensure we have latest stock info
        const products = JSON.parse(localStorage.getItem(config.storageKeys.products)) || [];
        const currentProduct = products.find(p => p.id === product.id || p.id.toString() === product.id.toString());
        
        if (!currentProduct) {
            throw new Error('Product not found in database');
        }

        const wishlistKey = getUserStorageKey(config.storageKeys.wishlist);
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        const exists = wishlist.some(item => item.id === product.id || item.id.toString() === product.id.toString());
        
        if (!exists) {
            wishlist.push({
                id: currentProduct.id,
                name: currentProduct.name,
                price: parseFloat(currentProduct.price),
                image: currentProduct.image,
                description: currentProduct.description,
                stock: currentProduct.stock // Include stock information
            });
            localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
            showToast(`${currentProduct.name} added to wishlist`);
            updateWishlistCount();
        } else {
            showToast(`${currentProduct.name} is already in your wishlist`);
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        handleError(error, 'adding to wishlist');
        showToast('Error adding product to wishlist');
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
  