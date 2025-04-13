document.addEventListener("DOMContentLoaded", function () {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const productList = document.getElementById("productList");

    if (productList) {
        products.forEach(function (product, index) {
            const productRow = document.createElement("tr");
            productRow.innerHTML = `
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td>${product.quantity}</td>
                <td>${product.category}</td>
                <td><img src="${product.image}" alt="Product Image" width="50" class="img-thumbnail"></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editProduct(${index})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${index})">Delete</button>
                </td>
            `;
            productList.appendChild(productRow);
        });
    }
});

// Edit product
function editProduct(index) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products[index];

    // Show edit form (this can be a modal or a separate form page)
    const name = prompt("Edit product name:", product.name);
    const price = prompt("Edit product price:", product.price);
    const quantity = prompt("Edit product quantity:", product.quantity);
    const category = prompt("Edit product category:", product.category);
    const image = prompt("Edit product image URL:", product.image);

    if (name && price && quantity && category && image) {
        products[index] = { ...product, name, price, quantity, category, image };
        localStorage.setItem("products", JSON.stringify(products));
        window.location.reload();  // Refresh the page to reflect changes
    }
}

// Delete product
function deleteProduct(index) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (confirmDelete) {
        products.splice(index, 1);  // Remove product from array
        localStorage.setItem("products", JSON.stringify(products));
        window.location.reload();  // Refresh the page to reflect changes
    }
}
