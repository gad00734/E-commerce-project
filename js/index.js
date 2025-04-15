const apiUrl = 'data.json';

async function getProducts() {
    try {
        const response = await fetch(apiUrl);
        const products = await response.json();
        const productList = document.getElementById('product-list');

        // Clean product data function
        const cleanProductData = (product) => {
            // Ensure that the product is valid before processing
            if (!product || !product.title || !product.price || !product.image) {
                console.error('Invalid product data:', product); // Log invalid product for debugging
                return {}; // Return an empty object if product is invalid
            }

            // Sanitize the title and description
            const cleanTitle = product.title.replace(/[\n\r\t]/g, ' ').replace(/'/g, ''); // Remove single quotes
            const cleanDescription = product.description 
                ? product.description.replace(/[\n\r\t]/g, ' ').replace(/'/g, '') // Clean description
                : ''; // Use empty string if no description is provided

            return {
                ...product,
                title: cleanTitle,
                description: cleanDescription
            };
        };

        // Loop through products
        products.forEach(product => {
            const cleanProduct = cleanProductData(product);

            // Skip rendering if cleanProduct is invalid
            if (Object.keys(cleanProduct).length === 0) return;  // Skip this product if invalid

            const productCard = document.createElement('div');
            productCard.classList.add('col-lg-3', 'col-md-6', 'mb-4');
            productCard.innerHTML = `
                <div class="product-card card h-100 shadow-sm border-0">
                    <img src="${cleanProduct.image}" class="card-img-top" alt="${cleanProduct.title}">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold">${cleanProduct.title}</h5>
                        <p class="card-text text-muted">$${cleanProduct.price}</p>
                        <button class="btn btn-success btn-sm rounded-pill view-details-btn" data-product='${encodeURIComponent(JSON.stringify(cleanProduct))}'>View Details</button>
                        <button class="btn btn-success btn-sm rounded-pill add-to-cart-btn" data-id="${cleanProduct.id}">Add to Cart</button>
                        <button class="btn btn-danger btn-sm rounded-pill add-to-wishlist-btn" data-product='${encodeURIComponent(JSON.stringify(cleanProduct))}'>
                            <i class="bi bi-heart"></i> 
                        </button>
                    </div>
                </div>
            `;

            // Event Listeners after productCard is created
            productCard.querySelector('.view-details-btn').addEventListener('click', () => {
                showProductModal(cleanProduct);
            });

            productCard.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                addToCart(cleanProduct);
            });

            // Wishlist button event listener
            productCard.querySelector('.add-to-wishlist-btn').addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const productDataString = decodeURIComponent(btn.dataset.product); // Decode before parsing

                try {
                    // Parse the cleaned and decoded string
                    const productData = JSON.parse(productDataString);

                    // Ensure valid product data before adding to wishlist
                    if (productData && productData.id && productData.title) {
                        addToWishlist(productData);
                    } else {
                        console.error("Invalid product data:", productData);
                        showToast("Oops! Something went wrong while adding to the wishlist.");
                    }
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    showToast("Oops! Something went wrong while adding to the wishlist.");
                }
            });

            // Append product card to DOM
            productList.appendChild(productCard);
        });

    } catch (error) {
        console.error("Error fetching products:", error);
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

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    updateNavbar();
    if (isUserLoggedIn()) {
        updateCartCount();
        updateWishlistCount();
    }
    
    // Initialize elements
    const productList = document.getElementById('product-list');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    
    let products = [];
    let categories = [];

    // Normalize product data
    function normalizeProduct(product) {
        if (!product) return null;
        
        return {
            id: product.id,
            name: product.name || product.title || '',
            price: parseFloat(product.price) || 0,
            description: product.description || '',
            image: product.image || '',
            categoryId: product.categoryId || null,
            quantity: product.quantity || 1
        };
    }

    // Normalize image path
    function normalizeImagePath(path) {
        if (!path) return '';
        return path.startsWith('http') ? path : `http://localhost:3000${path}`;
    }

    // Load categories and products
    Promise.all([
        fetch('http://localhost:3000/categories').then(res => {
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        }),
        fetch('http://localhost:3000/products').then(res => {
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        })
    ])
    .then(([categoriesData, productsData]) => {
        categories = categoriesData;
        products = productsData.map(normalizeProduct).filter(Boolean);

        // Populate category filter
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        }

        // Display initial products and categories
        displayProducts(products);
        displayCategories(categories);

        // Add event listeners for filtering
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterProducts);
        }
        if (searchInput) {
            searchInput.addEventListener('input', filterProducts);
        }
    })
    .catch(err => {
        console.error('Error loading data:', err);
        showToast('Error loading data. Please try again later.');
        if (productList) {
            productList.innerHTML = '<div class="col-12 text-center"><p>Error loading products. Please try again later.</p></div>';
        }
    });

    // Filter products based on category and search
    function filterProducts() {
        if (!categoryFilter || !searchInput) return;
        
        const selectedCategory = categoryFilter.value;
        const searchTerm = searchInput.value.toLowerCase().trim();

        const filtered = products.filter(product => {
            const matchesCategory = selectedCategory === 'all' || 
                                  (product.categoryId && product.categoryId.toString() === selectedCategory.toString());
            const matchesSearch = product.name.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        displayProducts(filtered);
    }

    // Display products in grid
    function displayProducts(productsToShow) {
        if (!productList) return;
        
        productList.innerHTML = '';
        
        if (!productsToShow || productsToShow.length === 0) {
            productList.innerHTML = '<div class="col-12 text-center"><p>No products found.</p></div>';
            return;
        }

        productsToShow.forEach(product => {
            const normalizedProduct = normalizeProduct(product);
            if (!normalizedProduct) return;

            const categoryName = categories.find(c => c.id.toString() === normalizedProduct.categoryId?.toString())?.name || '';
            const imagePath = normalizeImagePath(normalizedProduct.image);
            
            const productCard = document.createElement('div');
            productCard.className = 'col-md-3 col-sm-6 mb-4';
            productCard.innerHTML = `
                <div class="card h-100 product-card">
                    <img src="${imagePath}" class="card-img-top" alt="${normalizedProduct.name}" 
                         style="height: 200px; object-fit: cover;"
                         onerror="this.src='images/placeholder.jpg'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${normalizedProduct.name}</h5>
                        <p class="card-text text-muted mb-1">${categoryName}</p>
                        <p class="card-text mb-2">${normalizedProduct.description}</p>
                        <div class="mt-auto">
                            <p class="h5 mb-2 text-success">$${normalizedProduct.price.toFixed(2)}</p>
                            <div class="d-flex gap-2">
                                <button class="btn btn-primary flex-grow-1 add-to-cart-btn" 
                                        data-product='${JSON.stringify(normalizedProduct).replace(/'/g, "&apos;")}'>
                                    Add to Cart
                                </button>
                                <button class="btn btn-outline-danger add-to-wishlist-btn"
                                        data-product='${JSON.stringify(normalizedProduct).replace(/'/g, "&apos;")}'>
                                    <i class="bi bi-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add event listeners after creating the card
            productCard.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
                const productData = JSON.parse(e.currentTarget.dataset.product);
                addToCart(productData);
            });

            productCard.querySelector('.add-to-wishlist-btn').addEventListener('click', (e) => {
                const productData = JSON.parse(e.currentTarget.dataset.product);
                addToWishlist(productData);
            });

            // Append product card to DOM
            productList.appendChild(productCard);
        });
    }

    // Display categories
    function displayCategories(categories) {
        const categorySection = document.getElementById('category-section');
        if (!categorySection) return;

        categorySection.innerHTML = '';
        categories.forEach(category => {
            const imagePath = normalizeImagePath(category.image);
            
            const categoryCard = document.createElement('div');
            categoryCard.className = 'col-6 col-sm-4 col-md-3 mb-4 text-center';
            categoryCard.innerHTML = `
                <div class="category-circle mx-auto">
                    <img src="${imagePath}" 
                         alt="${category.name}" 
                         class="img-fluid rounded-circle category-img"
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <p class="mt-2 fw-semibold">${category.name}</p>
            `;
            categorySection.appendChild(categoryCard);
        });
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

function addToCart(product) {
    try {
        if (!isUserLoggedIn()) {
            showToast('Please log in to add items to cart');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        const normalizedProduct = {
            id: product.id,
            name: product.name || product.title || '',
            price: parseFloat(product.price) || 0,
            image: product.image || '',
            description: product.description || '',
            quantity: 1,
            stock: product.quantity || 0
        };

        // Validate product data
        if (!normalizedProduct.id || !normalizedProduct.name || normalizedProduct.price <= 0) {
            throw new Error('Invalid product data');
        }

        const cartKey = getUserStorageKey('cart');
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const existingProduct = cart.find(item => item.id === normalizedProduct.id);
        
        if (existingProduct) {
            if (existingProduct.quantity + 1 > normalizedProduct.stock) {
                showToast(`Sorry, only ${normalizedProduct.stock} items available in stock!`);
                return;
            }
            existingProduct.quantity += 1;
            showToast(`Increased ${normalizedProduct.name} quantity in cart!`);
        } else {
            if (normalizedProduct.stock === 0) {
                showToast(`Sorry, ${normalizedProduct.name} is out of stock!`);
                return;
            }
            cart.push(normalizedProduct);
            showToast(`${normalizedProduct.name} added to cart!`);
        }
        
        localStorage.setItem(cartKey, JSON.stringify(cart));
        updateCartCount();
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
            name: product.name || product.title || '',
            price: parseFloat(product.price) || 0,
            image: product.image || '',
            description: product.description || ''
        };

        if (!normalizedProduct.id || !normalizedProduct.name) {
            throw new Error('Invalid product data');
        }

        const wishlistKey = getUserStorageKey('wishlist');
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        const exists = wishlist.some(item => item && item.id === normalizedProduct.id);
        
        if (!exists) {
            wishlist.push(normalizedProduct);
            localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
            showToast(`${normalizedProduct.name} added to wishlist`);
            updateWishlistCount();
        } else {
            showToast(`${normalizedProduct.name} is already in your wishlist`);
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showToast('Failed to add item to wishlist. Please try again.');
    }
}

// Update navbar based on login state
function updateNavbar() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const loginLink = document.getElementById("nav-login");
    const registerLink = document.getElementById("nav-register");
    const logoutLink = document.getElementById("nav-logout");
    const userDisplay = document.getElementById("nav-user");
    const cartCount = document.getElementById("cart-count");
    const wishlistCount = document.getElementById("wishlistCount");

    if (loggedInUser) {
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";
        if (logoutLink) logoutLink.style.display = "inline-block";
        if (userDisplay) userDisplay.textContent = `Hello, ${loggedInUser.username}`;
        
        // Update counters for logged-in user
        updateCartCount();
        updateWishlistCount();
    } else {
        if (loginLink) loginLink.style.display = "inline-block";
        if (registerLink) registerLink.style.display = "inline-block";
        if (logoutLink) logoutLink.style.display = "none";
        if (userDisplay) userDisplay.textContent = "";
        if (cartCount) cartCount.textContent = "0";
        if (wishlistCount) wishlistCount.textContent = "0";
    }
}

// Update cart counter
function updateCartCount() {
    if (!isUserLoggedIn()) return;
    
    const cartKey = getUserStorageKey('cart');
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
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
