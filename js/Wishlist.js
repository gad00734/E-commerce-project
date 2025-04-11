function returnWishListProducts() {
  const wishListProduct = JSON.parse(localStorage.getItem('wishListProduct')) || [];
  const wishlistItemsContainer = document.getElementById('wishlistItems');
  wishlistItemsContainer.innerHTML = '';
  wishListProduct.forEach((product, index) => {
    const productHTML = `
      <div class="col-md-4 wishlistItem" data-name="${product.title}">
        <div class="wishlistCard">
          <img src="${product.image}" class="productImg" alt="${product.title}">
          <div class="cardBody">
            <h5>${product.title}</h5>
            <p class="text-muted">$${product.price}</p>
            <div class="d-flex justify-content-between">
              <button class="btn btnAdd add-to-cart" onclick="addToCart(${product.id})"><i class="bi bi-cart-plus"></i> Add to Cart</button>
              <button class="btn btnRemove remove-item" onclick="removeFromWishList(${index})"><i class="bi bi-x-lg"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;
    wishlistItemsContainer.insertAdjacentHTML('beforeend', productHTML);
  });
  document.getElementById('wishlistCount').textContent = `${wishListProduct.length} items`;
}

function addToCart(productId) {
  const product = wishListProduct.find(p => p.id === productId);
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const productIndex = cart.findIndex(p => p.id === productId);

  if (productIndex !== -1) {
    cart[productIndex].quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  const toastAdd = new bootstrap.Toast(document.getElementById('toastAdd'));
  toastAdd.show();

  document.getElementById('cartBadgeCount').textContent = cart.length;
}

function removeFromWishList(index) {
  const wishListProduct = JSON.parse(localStorage.getItem('wishListProduct')) || [];
  wishListProduct.splice(index, 1);
  localStorage.setItem('wishListProduct', JSON.stringify(wishListProduct));
  returnWishListProducts();
}

returnWishListProducts();

document.getElementById('cartBadgeCount').textContent = JSON.parse(localStorage.getItem('cart'))?.length || 0;
document.getElementById('wishlistCount').textContent = JSON.parse(localStorage.getItem('wishListProduct'))?.length || 0;