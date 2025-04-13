window.onload = function() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
  
    // Remove any empty orders
    orders = orders.filter(order => order.items.length > 0);
  
    // Update localStorage with the filtered orders
    localStorage.setItem('orders', JSON.stringify(orders));
  
    const orderTableBody = document.getElementById('orderTableBody');
  
    // If no orders, show a message
    if (orders.length === 0) {
      orderTableBody.innerHTML = '<tr><td colspan="6">No orders placed yet.</td></tr>';
    } else {
      // Populate the table with the order data
      orders.forEach(order => {
        // Create a string for each product's details
        let productDetails = order.items.map(item => {
          return `
            <div class="product-section">
              <h5>${item.title}</h5> <!-- Displaying product name -->
              <p>Quantity: ${item.quantity}</p> <!-- Displaying quantity -->
              <p>Price: $${item.price}</p> <!-- Displaying price -->
              <p>Total: $${(item.price * item.quantity).toFixed(2)}</p> <!-- Displaying total for each product -->
            </div>
          `;
        }).join('');
  
        let row = `
          <tr>
            <td>${order.orderID}</td>
            <td>${order.date}</td>
            <td>${productDetails}</td> <!-- Displaying product details dynamically -->
            <td>$${order.totalPrice}</td>
            <td><span class="badge bg-warning text-dark">${order.status}</span></td>
          </tr>
        `;
        orderTableBody.innerHTML += row;
      });
    }
  };
  