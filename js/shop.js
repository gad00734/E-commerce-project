document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }
    
    loadCategoriesToDropdown();
    getProducts();
    updateNavbar();
    updateCartCount();
    updateWishlistCount();
    
    // Add search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm)
            );
            renderProducts(filteredProducts);
        });
    }

    // Add category filter event listener
    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) {
        categoryFilter.addEventListener("change", (e) => {
            const selectedCategory = e.target.value;
            filterProductsByCategory(selectedCategory);
        });
    }
  });
  
  async function loadCategoriesToDropdown() {
    try {
      const res = await fetch("http://localhost:3000/categories");
      const categories = await res.json();
      const dropdown = document.getElementById("categoryFilter");
  
        // Clear existing options
        dropdown.innerHTML = '';
        
        // Add "All Categories" option
        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.textContent = "All Categories";
        dropdown.appendChild(allOption);

        // Add categories from the server
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;  // Use category ID as value
            option.textContent = cat.name;
            dropdown.appendChild(option);
        });

        // Cache categories for offline use
        localStorage.setItem('categories', JSON.stringify(categories));
    } catch (err) {
        console.error("Failed to load categories:", err);
        // Try to load from cache if server fails
        const cachedCategories = JSON.parse(localStorage.getItem('categories')) || [];
        if (cachedCategories.length > 0) {
            loadCachedCategories(cachedCategories);
        } else {
            showToast("Failed to load categories. Please try again later.", "error");
        }
    }
}

function loadCachedCategories(categories) {
    const dropdown = document.getElementById("categoryFilter");
    if (!dropdown) return;

    // Clear existing options
    dropdown.innerHTML = '';
    
    // Add "All Categories" option
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Categories";
    dropdown.appendChild(allOption);

    // Add cached categories
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;  // Use category ID as value
        option.textContent = cat.name;
        dropdown.appendChild(option);
      });
}

// Function to filter products by category
function filterProductsByCategory(categoryId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (categoryId === 'all') {
        renderProducts(products);
        return;
    }

    const filteredProducts = products.filter(product => 
        product.categoryId === categoryId
    );

    renderProducts(filteredProducts);
}

// Function to update the navbar and user information
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
        
        // Update cart counter
        updateCartCount();
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

// Function to add to cart
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

// Function to add to wishlist
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

// Function to get all products
async function getProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        renderProducts(products);
        // Cache the products
        localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
        console.error('Error fetching products:', error);
        // Use cached products if available
        const cachedProducts = JSON.parse(localStorage.getItem('products')) || [];
        if (cachedProducts.length > 0) {
            renderProducts(cachedProducts);
        } else {
            showToast('Error loading products. Please try again later.', 'error');
        }
    }
}

// Function to render products
function renderProducts(products) {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '';
    
    if (!products || products.length === 0) {
        productList.innerHTML = '<div class="col-12 text-center"><p>No products found.</p></div>';
        return;
    }

    products.forEach(product => {
        const stockQuantity = parseInt(product.quantity) || 0;
        const inStock = stockQuantity > 0;
        
        const productCard = document.createElement('div');
        productCard.className = 'col-lg-3 col-md-6 mb-4';
        productCard.innerHTML = `
            <div class="product-card card h-100 shadow-sm border-0">
                <img src="${product.image}" class="card-img-top product-img" alt="${product.name}" 
                     onerror="this.src='images/placeholder.jpg'">
                <div class="card-body text-center">
                    <h5 class="card-title fw-bold">${product.name}</h5>
                    <p class="card-text text-muted">$${parseFloat(product.price).toFixed(2)}</p>
                    ${inStock 
                        ? `<span class="badge bg-success">In Stock (${stockQuantity})</span>`
                        : '<span class="badge bg-danger">Out of Stock</span>'
                    }
                    <div class="mt-3">
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
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        const wishlistBtn = productCard.querySelector('.add-to-wishlist-btn');

        if (inStock) {
            addToCartBtn.addEventListener('click', () => {
                addToCart(product);
            });
        }

        wishlistBtn.addEventListener('click', () => {
            addToWishlist(product);
        });

        productList.appendChild(productCard);
    });
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
  