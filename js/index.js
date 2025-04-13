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

        categorySection.innerHTML = ""; // Clear any existing categories

        categories.forEach(category => {
            // Sanitize
            const name = category.name.replace(/[\n\r\t]/g, ' ').replace(/'/g, '');
            const image = category.image;

            const categoryCard = document.createElement('div');
            categoryCard.classList.add('col-lg-3', 'col-md-6', 'mb-4');

            categoryCard.innerHTML = `
                <div class="card h-100 text-center border-0 shadow-sm">
                    <img src="${image}" class="card-img-top" alt="${name}" style="height: 150px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${name}</h5>
                        <button class="btn btn-outline-success btn-sm">View Products</button>
                    </div>
                </div>
            `;

            categorySection.appendChild(categoryCard);
        });

    } catch (error) {
        console.error("Error loading categories:", error);
    }
}


// Add product to cart and update localStorage
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
    const index = cart.findIndex(item => item.id === product.id);
  
    if (index > -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
  
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    showToast(`${product.title} added to cart`);
}



function showToast(message) {
    const toastElement = document.getElementById('liveToast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = message;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Update cart counter
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalItems = 0;
    
    cart.forEach(item => {
        totalItems += item.quantity;
    });
    
    document.getElementById('cart-count').textContent = totalItems;
}

function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCountElem = document.getElementById('wishlistCount');
    if (wishlistCountElem) {
        wishlistCountElem.textContent = wishlist.length;
    }
}

function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    const exists = wishlist.some(item => item && item.id === product.id);
    if (!exists) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        showToast(`${product.title} added to wishlist`);
        updateWishlistCount();  // Make sure it's updated here
    } else {
        showToast(`${product.title} is already in your wishlist`);
    }

    console.log("Wishlist:", wishlist);
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateWishlistCount();
    getProducts();
    getCategories(); // Load categories from backend
});
