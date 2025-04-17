const apiUrl = 'data.json';

async function getProducts() {
    try {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Clear existing products

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('col-lg-3', 'col-md-6', 'mb-4');
            
            // Check stock status
            const inStock = product.stock > 0;
            const stockStatus = inStock 
                ? `<span class="badge bg-success">In Stock (${product.stock})</span>`
                : '<span class="badge bg-danger">Out of Stock</span>';
            
            productCard.innerHTML = `
                <div class="product-card card h-100 shadow-sm border-0">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}" 
                         onerror="this.src='images/placeholder.jpg'">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold">${product.name}</h5>
                        <p class="card-text text-muted">$${product.price.toFixed(2)}</p>
                        ${stockStatus}
                        <div class="mt-3">
                            <button class="btn btn-success btn-sm rounded-pill view-details-btn" 
                                    data-product='${encodeURIComponent(JSON.stringify(product))}'>
                                View Details
                            </button>
                            <button class="btn btn-success btn-sm rounded-pill add-to-cart-btn" 
                                    data-id="${product.id}"
                                    ${!inStock ? 'disabled' : ''}>
                                ${inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            <button class="btn btn-danger btn-sm rounded-pill add-to-wishlist-btn" 
                                    data-product='${encodeURIComponent(JSON.stringify(product))}'>
                                <i class="bi bi-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Add event listeners
            const viewDetailsBtn = productCard.querySelector('.view-details-btn');
            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            const wishlistBtn = productCard.querySelector('.add-to-wishlist-btn');

            viewDetailsBtn.addEventListener('click', () => {
                showProductModal(product);
            });

            if (inStock) {
                addToCartBtn.addEventListener('click', () => {
                    addToCart(product);
                });
            }

            wishlistBtn.addEventListener('click', (e) => {
                try {
                    const productData = JSON.parse(decodeURIComponent(e.currentTarget.dataset.product));
                    if (productData && productData.id && productData.name) {
                        addToWishlist(productData);
                    } else {
                        showToast("Error: Invalid product data");
                    }
                } catch (error) {
                    console.error("Error parsing product data:", error);
                    showToast("Error adding to wishlist");
                }
            });

            productList.appendChild(productCard);
        });

    } catch (error) {
        console.error("Error loading products:", error);
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

async function getCategories() {
    try {
        let categories = [];
        
        // First try to get from backend
        try {
            const response = await fetch("http://localhost:3000/categories");
            if (response.ok) {
                categories = await response.json();
                // Update localStorage with backend data
                localStorage.setItem('categories', JSON.stringify(categories));
            } else {
                throw new Error('Failed to fetch from backend');
            }
        } catch (error) {
            console.warn('Failed to fetch categories from backend, using localStorage:', error);
            // If backend fails, use localStorage
            categories = JSON.parse(localStorage.getItem('categories')) || [];
        }

        const categorySection = document.getElementById("category-section");
        const categoryFilter = document.getElementById("categoryFilter");

        if (!categorySection && !categoryFilter) return;

        // Update category filter dropdown
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(category => {
                categoryFilter.innerHTML += `
                    <option value="${category.id}">${category.name}</option>
                `;
            });
        }

        // Update category section
        if (categorySection) {
            categorySection.innerHTML = ""; // Clear existing

            categories.forEach(category => {
                const name = category.name.replace(/[\n\r\t]/g, ' ').replace(/'/g, '');
                const image = category.image || 'images/placeholder.jpg';

                const categoryCard = document.createElement('div');
                categoryCard.classList.add('col-6', 'col-sm-4', 'col-md-3', 'mb-4', 'text-center');

                categoryCard.innerHTML = `
                    <div class="category-circle mx-auto">
                        <img src="${image}" alt="${name}" class="img-fluid rounded-circle category-img">
                    </div>
                    <p class="mt-2 fw-semibold">${name}</p>
                `;

                categorySection.appendChild(categoryCard);
            });
        }

    } catch (error) {
        console.error("Error loading categories:", error);
        showToast("Error loading categories. Please try again later.");
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize navbar, cart count, and wishlist count
    updateCartCount();
    updateWishlistCount();
    
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    
    try {
        // Get data from localStorage
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];

        // Populate category filter
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(category => {
                categoryFilter.innerHTML += `
                    <option value="${category.id}">${category.name}</option>
                `;
            });
        }

        // Display categories and products
        displayCategories(categories);
        displayProducts(products);

    } catch (error) {
        console.error('Error loading data:', error);
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

    // Add event listeners for filtering
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
});

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

// Add product to cart and update localStorage
function addToCart(product) {
    try {
        if (!isUserLoggedIn()) {
            showToast('Please log in to add items to cart');
            setTimeout(() => {
                window.location.href = config.urls.login;
            }, 1500);
            return;
        }

        // Check if product is in stock
        const products = JSON.parse(localStorage.getItem(config.storageKeys.products)) || [];
        const currentProduct = products.find(p => p.id === product.id);
        
        if (!currentProduct || currentProduct.stock <= 0) {
            showToast(`Sorry, ${product.name} is out of stock!`);
            return;
        }

        const cartKey = getUserStorageKey(config.storageKeys.cart);
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const existingProduct = cart.find(item => item.id === product.id);

        if (existingProduct) {
            if (existingProduct.quantity + 1 > currentProduct.stock) {
                showToast(`Sorry, only ${currentProduct.stock} items available in stock!`);
                return;
            }
            existingProduct.quantity += 1;
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
        handleError(error, 'adding to cart');
    }
}

function addToWishlist(product) {
    try {
        if (!isUserLoggedIn()) {
            showToast('Please log in to add items to wishlist');
            setTimeout(() => {
                window.location.href = config.urls.login;
            }, 1500);
            return;
        }

        const normalizedProduct = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
            description: product.description
        };

        const wishlistKey = getUserStorageKey(config.storageKeys.wishlist);
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        const exists = wishlist.some(item => item.id === normalizedProduct.id);
        
        if (!exists) {
            wishlist.push(normalizedProduct);
            localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
            showToast(`${normalizedProduct.name} added to wishlist`);
            updateWishlistCount();
        } else {
            showToast(`${normalizedProduct.name} is already in your wishlist`);
        }
    } catch (error) {
        handleError(error, 'adding to wishlist');
    }
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

// Show product modal
function showProductModal(product) {
    try {
        const modalTitle = document.getElementById('modal-title');
        const modalPrice = document.getElementById('modal-price');
        const modalStock = document.getElementById('modal-stock');
        const modalDescription = document.getElementById('modal-description');
        const modalImage = document.getElementById('modal-image');

        if (modalTitle) modalTitle.textContent = product.name;
        if (modalPrice) modalPrice.textContent = product.price.toFixed(2);
        if (modalStock) {
            modalStock.textContent = product.stock > 0 
                ? `In Stock (${product.stock} available)` 
                : 'Out of Stock';
            modalStock.className = `mb-3 ${product.stock > 0 ? 'text-success' : 'text-danger'}`;
        }
        if (modalDescription) modalDescription.textContent = product.description;
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

// Example filtering function (depends on your product API structure)
async function getProductsByCategory(category) {
    try {
        const res = await fetch(`http://localhost:3000/products?category=${category}`);
        const products = await res.json();
        renderProducts(products); // a function that renders them in productGrid
    } catch (err) {
        console.error("Error fetching products by category:", err);
    }
}

// Show Toast notification
function showToast(message) {
    const toastElement = document.getElementById('liveToast');
    const toastMsg = document.getElementById('toast-message');
    if (toastMsg && toastElement) {
    toastMsg.textContent = message;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    } else {
        console.log(message); // Fallback if toast elements don't exist
    }
}

// Display products in grid
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    No products found.
                </div>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('col-lg-3', 'col-md-6', 'mb-4');
        
        const inStock = product.stock > 0;
        const stockStatus = !inStock ? '<span class="badge bg-danger">Out of Stock</span>' : '';
        
        productCard.innerHTML = `
            <div class="product-card card h-100 shadow-sm border-0">
                <img src="${product.image || 'images/placeholder.jpg'}" class="card-img-top" 
                     alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                <div class="card-body text-center">
                    <h5 class="card-title fw-bold">${product.name}</h5>
                    <p class="card-text text-muted">$${(product.price || 0).toFixed(2)}</p>
                    ${stockStatus}
                    <div class="mt-3">
                        <button class="btn btn-success btn-sm rounded-pill view-details-btn" 
                                data-product='${JSON.stringify(product)}'>
                            View Details
                        </button>
                        <button class="btn btn-success btn-sm rounded-pill add-to-cart-btn" 
                                data-id="${product.id}"
                                ${!inStock ? 'disabled' : ''}>
                            ${inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button class="btn btn-danger btn-sm rounded-pill add-to-wishlist-btn" 
                                data-product='${JSON.stringify(product)}'>
                            <i class="bi bi-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const viewDetailsBtn = productCard.querySelector('.view-details-btn');
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        const wishlistBtn = productCard.querySelector('.add-to-wishlist-btn');

        viewDetailsBtn.addEventListener('click', (e) => {
            const productData = JSON.parse(e.target.dataset.product);
            showProductModal(productData);
        });

        if (inStock) {
            addToCartBtn.addEventListener('click', () => {
                addToCart(product);
            });
        }

        wishlistBtn.addEventListener('click', (e) => {
            const productData = JSON.parse(e.target.dataset.product);
            addToWishlist(productData);
        });

        productList.appendChild(productCard);
    });
}

// Display categories
function displayCategories(categories) {
    const categorySection = document.getElementById('category-section');
    if (!categorySection) return;

    categorySection.innerHTML = '';

    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.classList.add('col-6', 'col-sm-4', 'col-md-3', 'mb-4', 'text-center');

        categoryCard.innerHTML = `
            <div class="category-circle mx-auto">
                <img src="${category.image || 'images/placeholder.jpg'}" 
                     alt="${category.name}" 
                     class="img-fluid rounded-circle category-img"
                     onerror="this.src='images/placeholder.jpg'">
            </div>
            <p class="mt-2 fw-semibold">${category.name}</p>
        `;

        categorySection.appendChild(categoryCard);
    });
}

// Filter products based on category and search
function filterProducts() {
    try {
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        
        if (!categoryFilter || !searchInput) {
            console.error('Filter elements not found');
            return;
        }

        const selectedCategory = categoryFilter.value;
        const searchTerm = searchInput.value.toLowerCase().trim();
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        let filteredProducts = products;

        // Filter by category
        if (selectedCategory && selectedCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                String(product.category) === String(selectedCategory)
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
            selectedCategory,
            searchTerm,
            totalProducts: products.length,
            filteredCount: filteredProducts.length
        });

        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error filtering products:', error);
        showToast('Error filtering products');
    }
}

// Call updateNavbar when the page loads
document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();
    // Initialize tooltips if using Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Function to update cart display if on cart page
function updateCartDisplay() {
    if (typeof displayCartItems === 'function') {
        displayCartItems();
    }
}

// Initialize the page
async function initializePage() {
    try {
        // Check if user is logged in
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        
        // Update navbar based on login status
        updateNavbar();
        
        // Update counts
        updateCartCount();
        updateWishlistCount();
        
        // Load categories if needed
        await loadCategories();
        
        // Additional initialization if needed
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// Function to update the navbar based on login status
function updateNavbar() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const isLoggedIn = !!loggedInUser;

    // Update username display
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = isLoggedIn ? loggedInUser.username : 'Guest';
    }

    // Update navigation items visibility
    const navItems = {
        'nav-login': !isLoggedIn,
        'nav-register': !isLoggedIn,
        'nav-logout': isLoggedIn,
        'nav-profile': isLoggedIn,
        'nav-orders': isLoggedIn,
        'nav-wishlist': isLoggedIn
    };

    Object.entries(navItems).forEach(([id, show]) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    });
}

// Function to update cart count
function updateCartCount() {
    try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser) return;

        const cartKey = `${loggedInUser.id || loggedInUser.username}_cart`;
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

        // Update all cart count elements
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
    } catch (error) {
        console.warn('Error updating cart count:', error);
    }
}

// Function to update wishlist count
function updateWishlistCount() {
    try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser) return;

        const wishlistKey = `${loggedInUser.id || loggedInUser.username}_wishlist`;
        const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        
        const wishlistCountElements = document.querySelectorAll('[id^="wishlist"]');
        wishlistCountElements.forEach(element => {
            if (element && element.id.toLowerCase().includes('count')) {
                element.textContent = wishlist.length.toString();
            }
        });
    } catch (error) {
        console.warn('Error updating wishlist count:', error);
    }
}

// Function to load categories
async function loadCategories() {
    try {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const categorySelect = document.getElementById('categoryFilter');
        
        if (categorySelect) {
            categorySelect.innerHTML = `
                <option value="">All Categories</option>
                ${categories.map(category => `
                    <option value="${category.id}">${category.name}</option>
                `).join('')}
            `;
        }
    } catch (error) {
        console.warn('Error loading categories:', error);
    }
}

// Handle search functionality
function handleSearch(event) {
    try {
        const searchTerm = event.target.value.toLowerCase().trim();
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        let filteredProducts = products;
        if (searchTerm) {
            filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }

        displayProducts(filteredProducts);
    } catch (error) {
        console.warn('Error handling search:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    try {
        // Logout handler
        const logoutButton = document.getElementById('nav-logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('loggedInUser');
                window.location.href = 'login.html';
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', filterProducts); // Use filterProducts instead of handleSearch
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterProducts);
        }

    } catch (error) {
        console.warn('Error setting up event listeners:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializePage);

// Export functions that might be needed by other scripts
window.initializePage = initializePage;
window.updateNavbar = updateNavbar;
window.updateCartCount = updateCartCount;
window.updateWishlistCount = updateWishlistCount;
