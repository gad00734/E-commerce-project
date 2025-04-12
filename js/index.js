const apiUrl = 'data.json';

async function getProducts() {
    try {
        const response = await fetch(apiUrl);
        const products = await response.json();
        const productList = document.getElementById('product-list');

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('col-lg-3', 'col-md-6', 'mb-4');
            productCard.innerHTML = `
    <div class="product-card card h-100 shadow-sm border-0">
        <img src="${product.image}" class="card-img-top" alt="${product.title}">
        <div class="card-body text-center">
            <h5 class="card-title fw-bold">${product.title}</h5>
            <p class="card-text text-muted">$${product.price}</p>
            <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-primary btn-sm rounded-pill view-details">View Details</button>
                <a href="#" class="btn btn-primary btn-sm rounded-pill" onclick="addToCart({title: 'Product Name', image: 'image.jpg', price: 29.99})">Add to Cart</a>

            </div>
        </div>
    </div>
`;

// Function to add an item to the cart
function addToCart(product) {
    // Get the current cart from localStorage, or create a new array if it's empty
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Add the new product to the cart
    cart.push(product);

    // Save the updated cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update the cart icon count
    updateCartIcon();
}

// Function to update the cart icon count in the navbar
function updateCartIcon() {
    // Get the current cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Get the count of items in the cart
    const cartCount = cart.length;

    // Get the cart count element in the navbar
    const cartCountElement = document.getElementById('cart-count');

    // Update the text content of the cart count element
    cartCountElement.textContent = cartCount;

    // If cart is empty, hide the badge (optional)
    if (cartCount === 0) {
        cartCountElement.style.display = 'none';
    } else {
        cartCountElement.style.display = 'inline';
    }
}

// Update the cart icon when the page loads
updateCartIcon();



            // Append to list
            productList.appendChild(productCard);

            // Get the "View Details" button inside the card
            const viewBtn = productCard.querySelector('.view-details');
            viewBtn.addEventListener('click', () => {
                showProductModal(product);
            });
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Show product in modal
function showProductModal(product) {
    document.getElementById('modal-title').textContent = product.title;
    document.getElementById('modal-description').textContent = product.description;
    document.getElementById('modal-price').textContent = product.price;
    document.getElementById('modal-rating').textContent = product.rating.rate;
    document.getElementById('modal-image').src = product.image;

    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    productModal.show();
}

getProducts();
