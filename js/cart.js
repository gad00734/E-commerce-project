document.addEventListener('DOMContentLoaded', () => {
  displayCartItems();
});

// Display cart items from localStorage
function displayCartItems() {
  const cartItemsContainer = document.getElementById('cartItems');
  const totalPriceElem = document.getElementById('totalPrice');
  const cartCount = document.getElementById('cartCount');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn'); // Button to clear cart
  
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  cartItemsContainer.innerHTML = '';
  let total = 0;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="text-muted">Your cart is empty.</p>`;
    cartCount.textContent = `${cart.length} item${cart.length > 1 ? 's' : ''}`;
    totalPriceElem.textContent = '$0.00';
    checkoutBtn.disabled = true;
    clearCartBtn.disabled = true; // Disable Clear Cart button when cart is empty
    return;
  }

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const cartItem = document.createElement('div');
    cartItem.classList.add('card', 'mb-3');
    cartItem.innerHTML = `
      <div class="row g-0 align-items-center">
        <div class="col-md-2">
          <img src="${item.image}" class="img-fluid rounded-start" alt="${item.title}">
        </div>
        <div class="col-md-7">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            <div class="d-flex align-items-center">
              <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 'decrease')">-</button>
              <span class="mx-3">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 'increase')">+</button>
            </div>
            <p class="card-text text-muted">$${item.price} × ${item.quantity}</p>
            <p class="card-text fw-bold">Total: $${itemTotal.toFixed(2)}</p>
          </div>
        </div>
        <div class="col-md-3 text-end pe-3">
          <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">
            <i class="bi bi-trash"></i> Remove
          </button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  totalPriceElem.textContent = `$${total.toFixed(2)}`;
  cartCount.textContent = `${cart.length} item${cart.length > 1 ? 's' : ''}`;
  checkoutBtn.disabled = false;
  clearCartBtn.disabled = false; // Enable Clear Cart button when there are items
}

// Update item quantity
function updateQuantity(productId, action) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const index = cart.findIndex(item => item.id === productId);

  if (index !== -1) {
    if (action === 'increase') {
      cart[index].quantity += 1;
    } else if (action === 'decrease' && cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
  }
}

// Remove item from cart
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCartItems();
}

// Clear all items from cart
function clearCart() {
  localStorage.removeItem('cart');
  displayCartItems();
}

// Dummy checkout simulation
function addOrder() {
  // Get the cart data (you can adjust this according to your cart structure)
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  

  // Generate a dummy order ID and total price for simulation
  const orderID = '#100' + Math.floor(Math.random() * 1000); // Random order ID
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  // Create order data
  const orderData = {
    orderID: orderID,
    date: new Date().toLocaleDateString(),
    items: cart,
    totalPrice: totalPrice,
    status: 'Pending'
  };

  // Store the order data in localStorage (you can append it if you want to store multiple orders)
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Clear the cart data after placing the order
  localStorage.removeItem('cart');
  displayCartItems();

  // Redirect to the orders page
  window.location.href = 'orders.html';
}


function cleanupEmptyOrders() {
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  // Filter out orders with no items
  orders = orders.filter(order => order.items.length > 0);
  
  // Save the updated orders back to localStorage
  localStorage.setItem('orders', JSON.stringify(orders));
}