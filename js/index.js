const apiUrl = 'data.json';

async function getProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        const products = await response.json();
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Clear existing products

        // Clean product data function
        const cleanProductData = (product) => {
            if (!product || !product.name || !product.price) {
                console.error('Invalid product data:', product);
                return null;
            }

            return {
                ...product,
                name: product.name.replace(/[\n\r\t]/g, ' ').replace(/'/g, ''),
                description: product.description 
                    ? product.description.replace(/[\n\r\t]/g, ' ').replace(/'/g, '')
                    : ''
            };
        };

        // Loop through products
        products.forEach(product => {
            const cleanProduct = cleanProductData(product);
            if (!cleanProduct) return;  // Skip invalid products

            const productCard = document.createElement('div');
            productCard.classList.add('col-lg-3', 'col-md-6', 'mb-4');
            
            // Check stock status
            const inStock = cleanProduct.quantity > 0;
            const stockStatus = inStock 
                ? `<span class="badge bg-success">In Stock (${cleanProduct.quantity})</span>`
                : '<span class="badge bg-danger">Out of Stock</span>';
            
            productCard.innerHTML = `
                <div class="product-card card h-100 shadow-sm border-0">
                    <img src="${cleanProduct.image}" class="card-img-top" alt="${cleanProduct.name}" 
                         onerror="this.src='images/placeholder.jpg'">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold">${cleanProduct.name}</h5>
                        <p class="card-text text-muted">$${cleanProduct.price.toFixed(2)}</p>
                        ${stockStatus}
                        <div class="mt-3">
                            <button class="btn btn-success btn-sm rounded-pill view-details-btn" 
                                    data-product='${encodeURIComponent(JSON.stringify(cleanProduct))}'>
                                View Details
                            </button>
                            <button class="btn btn-success btn-sm rounded-pill add-to-cart-btn" 
                                    data-id="${cleanProduct.id}"
                                    ${!inStock ? 'disabled' : ''}>
                                ${inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            <button class="btn btn-danger btn-sm rounded-pill add-to-wishlist-btn" 
                                    data-product='${encodeURIComponent(JSON.stringify(cleanProduct))}'>
                            <i class="bi bi-heart"></i> 
                        </button>
                        </div>
                    </div>
                </div>
            `;

            // Event Listeners
            const viewDetailsBtn = productCard.querySelector('.view-details-btn');
            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            const wishlistBtn = productCard.querySelector('.add-to-wishlist-btn');

            viewDetailsBtn.addEventListener('click', () => {
                showProductModal(cleanProduct);
            });

            if (inStock) {
                addToCartBtn.addEventListener('click', () => {
                addToCart(cleanProduct);
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
        console.error("Error fetching products:", error);
        const productList = document.getElementById('product-list');
        productList.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">
                    Error loading products. Please try again later.
                </div>
            </div>
        `;
    }
}

async function getCategories() {
    try {
        const response = await fetch("http://localhost:3000/categories");
        const categories = await response.json();
        const categorySection = document.getElementById("category-section");

        if (!categorySection) return;

        categorySection.innerHTML = ""; // Clear existing

        categories.forEach(category => {
            const name = category.name.replace(/[\n\r\t]/g, ' ').replace(/'/g, '');
            const image = category.image;

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

    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize navbar, cart count, and wishlist count
    updateCartCount();
    updateWishlistCount();
    
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    let categories = [];
    let products = [];
    
    try {
        // Try to fetch data from server
        const [categoriesResponse, productsResponse] = await Promise.allSettled([
            fetch('http://localhost:3000/categories'),
            fetch('http://localhost:3000/products')
        ]);

        // Handle categories
        if (categoriesResponse.status === 'fulfilled' && categoriesResponse.value.ok) {
            categories = await categoriesResponse.value.json();
            // Populate category filter
            if (categoryFilter) {
                categoryFilter.innerHTML = '<option value="all">All Categories</option>';
                categories.forEach(category => {
                    categoryFilter.innerHTML += `
                        <option value="${category.id}">${category.name}</option>
                    `;
                });
            }
            displayCategories(categories);
        } else {
            console.warn('Could not fetch categories, using cached data if available');
            categories = JSON.parse(localStorage.getItem('categories')) || [];
        }

        // Handle products
        if (productsResponse.status === 'fulfilled' && productsResponse.value.ok) {
            const productsData = await productsResponse.value.json();
            products = productsData.map(product => ({
                ...product,
                quantity: parseInt(product.quantity) || 0,
                price: parseFloat(product.price) || 0
            }));
            // Cache the products
            localStorage.setItem('products', JSON.stringify(products));
        } else {
            console.warn('Could not fetch products, using cached data');
            products = JSON.parse(localStorage.getItem('products')) || [];
        }

        // Display products regardless of data source
        displayProducts(products);

    } catch (error) {
        console.warn('Error loading data, using cached data:', error);
        // Use cached data from localStorage
        categories = JSON.parse(localStorage.getItem('categories')) || [];
        products = JSON.parse(localStorage.getItem('products')) || [];
        
        if (categoryFilter && categories.length > 0) {
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(category => {
                categoryFilter.innerHTML += `
                    <option value="${category.id}">${category.name}</option>
                `;
            });
        }
        
        displayProducts(products);
        displayCategories(categories);
    }

    // Add event listeners for filtering
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => filterProducts());
    }
    if (searchInput) {
        searchInput.addEventListener('input', () => filterProducts());
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
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        // Check if product is in stock
        fetch('http://localhost:3000/products')
            .then(response => response.json())
            .then(products => {
                const currentProduct = products.find(p => p.id === product.id);
                
                if (!currentProduct || currentProduct.quantity <= 0) {
                    showToast(`Sorry, ${product.name || product.title} is out of stock!`);
                    return;
                }

                const cartKey = getUserStorageKey('cart');
                let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
                const existingProduct = cart.find(item => item.id === product.id);

                if (existingProduct) {
                    if (existingProduct.quantity + 1 > currentProduct.quantity) {
                        showToast(`Sorry, only ${currentProduct.quantity} items available in stock!`);
                        return;
                    }
                    existingProduct.quantity += 1;
                    showToast(`Increased ${product.name || product.title} quantity in cart!`);
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name || product.title,
                        title: product.name || product.title,
                        price: parseFloat(product.price),
                        image: product.image,
                        quantity: 1,
                        stock: currentProduct.quantity
                    });
                    showToast(`${product.name || product.title} added to cart!`);
                }

                localStorage.setItem(cartKey, JSON.stringify(cart));
                updateCartCount();
                updateCartDisplay();
            })
            .catch(error => {
                console.error('Error checking stock:', error);
                showToast('Error checking stock. Please try again.');
            });
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add item to cart. Please try again.');
    }
}

function addToWishlist(product) {
    try {
        if (!isUserLoggedIn()) {
            showToast('Please log in to add items to wishlist');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        const normalizedProduct = {
            id: product.id,
            title: product.title || product.name || '',
            name: product.title || product.name || '',
            price: parseFloat(product.price) || 0,
            image: product.image || '',
            description: product.description || ''
        };

        if (!normalizedProduct.id || (!normalizedProduct.title && !normalizedProduct.name)) {
            throw new Error('Invalid product data');
        }

        const wishlistKey = getUserStorageKey('wishlist');
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        const exists = wishlist.some(item => item && item.id === normalizedProduct.id);
        
        if (!exists) {
            wishlist.push(normalizedProduct);
            localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
            showToast(`${normalizedProduct.title} added to wishlist`);
            updateWishlistCount();
        } else {
            showToast(`${normalizedProduct.title} is already in your wishlist`);
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showToast('Failed to add item to wishlist. Please try again.');
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

// Show product modal
function showProductModal(product) {
    document.getElementById('modal-title').textContent = product.title;
    document.getElementById('modal-description').textContent = product.description;
    document.getElementById('modal-price').textContent = product.price;
    document.getElementById('modal-rating').textContent = product.rating.rate;
    document.getElementById('modal-image').src = product.image;

    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    productModal.show();
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
function displayProducts(productsToShow) {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    productList.innerHTML = '';
    
    if (!productsToShow || productsToShow.length === 0) {
        productList.innerHTML = '<div class="col-12 text-center"><p>No products found.</p></div>';
        return;
    }

    productsToShow.forEach(product => {
        const stockQuantity = parseInt(product.quantity) || 0;
        const inStock = stockQuantity > 0;
        
        const productCard = document.createElement('div');
        productCard.className = 'col-lg-3 col-md-6 mb-4';
        productCard.innerHTML = `
            <div class="product-card card h-100 shadow-sm border-0">
                <img src="${product.image}" class="card-img-top" alt="${product.name}" 
                     onerror="this.src='images/placeholder.jpg'">
                <div class="card-body text-center">
                    <h5 class="card-title fw-bold">${product.name}</h5>
                    <p class="card-text text-muted">$${parseFloat(product.price).toFixed(2)}</p>
                    ${inStock 
                        ? `<span class="badge bg-success">In Stock (${stockQuantity})</span>`
                        : '<span class="badge bg-danger">Out of Stock</span>'
                    }
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

        viewDetailsBtn.addEventListener('click', (e) => {
            const productData = JSON.parse(decodeURIComponent(e.currentTarget.dataset.product));
            showProductModal(productData);
        });

        if (inStock) {
            addToCartBtn.addEventListener('click', () => {
                addToCart(product);
            });
        }

        wishlistBtn.addEventListener('click', (e) => {
            const productData = JSON.parse(decodeURIComponent(e.currentTarget.dataset.product));
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
    
    if (!categories || categories.length === 0) {
        categorySection.innerHTML = '<div class="col-12 text-center"><p>No categories found.</p></div>';
        return;
    }

    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'col-6 col-sm-4 col-md-3 mb-4 text-center';
        categoryCard.innerHTML = `
            <div class="category-circle mx-auto">
                <img src="${category.image}" 
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
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    if (!categoryFilter || !searchInput) return;
    
    const selectedCategory = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    const filtered = products.filter(product => {
        const matchesCategory = selectedCategory === 'all' || 
                            product.categoryId?.toString() === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });
    
    displayProducts(filtered);
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
