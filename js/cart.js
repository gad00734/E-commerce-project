// js/cart.js
document.addEventListener('DOMContentLoaded', () => {
  fetch('data.json') // Path to your JSON file
    .then(response => response.json())
    .then(data => {
      displayCartItems(data); // You can modify this function for your cart logic
    })
    .catch(error => {
      console.error('Error fetching JSON:', error);
    });
});

function displayCartItems(products) {
  const cartContainer = document.getElementById('cartItems');
  cartContainer.innerHTML = ''; // Clear existing

  products.forEach(product => {
    const item = document.createElement('div');
    item.className = 'card mb-3';
    item.innerHTML = `
      <div class="row g-0">
        <div class="col-md-4">
          <img src="${product.image}" class="img-fluid rounded-start" alt="${product.title}">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">${product.description}</p>
            <p class="card-text"><strong>$${product.price}</strong></p>
          </div>
        </div>
      </div>
    `;
    cartContainer.appendChild(item);
  });

  // Optional: update total price
  const total = products.reduce((sum, p) => sum + p.price, 0).toFixed(2);
  document.getElementById('totalPrice').textContent = `$${total}`;
  document.getElementById('cartCount').textContent = `${products.length} items`;
}


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