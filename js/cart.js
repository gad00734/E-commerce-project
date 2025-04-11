
function returnCartData() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let total = 0;
  cartItemsContainer.innerHTML = '';
  cart.forEach((product, index) => {
    const productHTML = `
        <div class="cartItem d-flex flex-column flex-sm-row align-items-center justify-content-between mb-3" data-index="${index}">
          <div class="d-flex align-items-center gap-3">
            <img src="${product.image}" alt="${product.title}" class="productImg">
            <div>
              <div class="productName">${product.title}</div>
              <div class="text-muted">$${product.price} each</div>
            </div>
          </div>
          <div class="quantityBox d-flex align-items-center gap-2">
            <button class="quantityBtn" onclick="updateQuantity(${index}, -1)">−</button>
            <span class="quantity">${product.quantity}</span>
            <button class="quantityBtn" onclick="updateQuantity(${index}, 1)">+</button>
          </div>
          <div><strong>$${(product.price * product.quantity).toFixed(2)}</strong></div>
          <button class="removeBtn" onclick="removeItemFromCart(${index})" title="Remove item">Remove</button>
        </div>
      `;
    cartItemsContainer.insertAdjacentHTML('beforeend', productHTML);
    total += product.price * product.quantity;
  });

  document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
  document.getElementById('cartCount').textContent = `${cart.length} items`;
}

function updateQuantity(index, delta) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart[index].quantity + delta > 0) {
    cart[index].quantity += delta;
    localStorage.setItem('cart', JSON.stringify(cart));
    returnCartData();
  }
}

function removeItemFromCart(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  returnCartData();
}

window.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkoutBtn');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length > 0) {
    checkoutBtn.disabled = false;
  } else {
    checkoutBtn.disabled = true;
  }
});

function addOrder() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const order = JSON.parse(localStorage.getItem('order')) || [];
  cart.forEach(product => {
    order.push({
      ...product,
      orderDate: new Date().toISOString()
    });
    localStorage.setItem('order', JSON.stringify(order));
    localStorage.removeItem('cart');
    returnCartData();
    alert("Don");

    document.getElementById('checkoutBtn').disabled = true;
    console.log(order);

  })
}

returnCartData();