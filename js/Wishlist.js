// Function to return wishlist products and display them
function returnWishListProducts() {
  const wishlist = (JSON.parse(localStorage.getItem('wishlist')) || []).filter(p => p && p.id && p.title && p.image);
  localStorage.setItem('wishlist', JSON.stringify(wishlist)); // Optional cleanup
  const wishlistItemsContainer = document.getElementById('wishlistItems');
  wishlistItemsContainer.innerHTML = ''; // Clear previous wishlist items

  wishlist.forEach((product, index) => {
    const productHTML = `
      <div class="col-md-4 wishlistItem" data-name="${product.title}">
        <div class="wishlistCard">
          <img src="${product.image}" class="productImg" alt="${product.title}">
          <div class="cardBody">
            <h5>${product.title}</h5>
            <p class="text-muted">$${product.price}</p>
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
  document.getElementById('wishlistCount').textContent = wishlist.length;
}

// Function to add product to cart
function addToCart(productId) {
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const product = wishlist.find(p => p.id === productId);

  if (!product) return; // If product is not found, exit

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const productIndex = cart.findIndex(p => p.id === productId);

  if (productIndex !== -1) {
    cart[productIndex].quantity += 1; // Update quantity if product already in cart
  } else {
    product.quantity = 1; // Add quantity for new product
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart)); // Save to localStorage

  // Show toast for adding product to cart
  const toastAdd = new bootstrap.Toast(document.getElementById('toastAdd'));
  toastAdd.show();

  // Update cart badge count
  document.getElementById('cartBadgeCount').textContent = cart.length;
}

// Function to remove product from wishlist
function removeFromWishList(index) {
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  wishlist.splice(index, 1); // Remove product from wishlist
  localStorage.setItem('wishlist', JSON.stringify(wishlist)); // Save to localStorage
  returnWishListProducts(); // Re-render wishlist
}

// Function to update wishlist count
function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  document.getElementById('wishlistCount').textContent = wishlist.length;
}

// Initialize wishlist and cart counts on page load
document.addEventListener('DOMContentLoaded', () => {
  returnWishListProducts(); // Display wishlist products
  document.getElementById('cartBadgeCount').textContent = JSON.parse(localStorage.getItem('cart'))?.length || 0;
  document.getElementById('wishlistCount').textContent = JSON.parse(localStorage.getItem('wishlist'))?.length || 0;
});
