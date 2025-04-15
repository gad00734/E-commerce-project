document.addEventListener("DOMContentLoaded", function() {
    const addProductForm = document.getElementById("addProductForm");
    const productsList = document.getElementById("productsList");
    
    // Load initial data
    loadProducts();
    loadCategoriesToDropdowns();

    // Add product
    addProductForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const formData = new FormData();
        const name = document.getElementById("productTitle").value;
        const price = document.getElementById("productPrice").value;
        const description = document.getElementById("productDescription").value;
        const categoryId = document.getElementById("productCategory").value;
        const quantity = document.getElementById("productQuantity").value;
        const image = document.getElementById("productImage").files[0];

        // Validate non-negative numbers
        if (parseFloat(price) < 0 || parseInt(quantity) < 0) {
            alert("Price and quantity cannot be negative!");
            return;
        }

        // Log the values to check
        console.log('Adding product:', { name, price, description, categoryId, quantity });

        formData.append("name", name);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("categoryId", categoryId);
        formData.append("quantity", quantity);
        formData.append("image", image);

        fetch('http://localhost:3000/products', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            alert("Product added successfully!");
            addProductForm.reset();
            loadProducts();
        })
        .catch(err => {
            console.error('Error:', err);
            alert("Error saving product");
        });
    });

    // Load products
    function loadProducts() {
        // First get categories to map IDs to names
        fetch('http://localhost:3000/categories')
            .then(response => response.json())
            .then(categories => {
                const categoryMap = {};
                categories.forEach(category => {
                    categoryMap[category.id] = category.name;
                });
                
                // Then load and display products
                return fetch('http://localhost:3000/products')
                    .then(response => response.json())
                    .then(products => {
                        productsList.innerHTML = "";
                        console.log('Loaded products:', products);
                        products.forEach(product => {
                            const row = document.createElement("tr");
                            row.innerHTML = `
                                <td>${product.id || ''}</td>
                                <td><img src="${product.image || ''}" alt="${product.name || ''}" style="width: 50px; height: 50px;"></td>
                                <td>${product.name || ''}</td>
                                <td>$${product.price || ''}</td>
                                <td>${categoryMap[product.categoryId] || product.categoryId || ''}</td>
                                <td>${product.quantity || 0}</td>
                                <td class="text-center">
                                    <button class="btn btn-warning" onclick="openEditProductForm(${JSON.stringify(product).replace(/"/g, "'")})">Edit</button>
                                    <button class="btn btn-danger ms-2" onclick="deleteProduct(${product.id})">Delete</button>
                                </td>
                            `;
                            productsList.appendChild(row);
                        });
                    });
            })
            .catch(err => console.error("Error loading products or categories:", err));
    }

    // Load categories into dropdowns
    function loadCategoriesToDropdowns() {
        fetch("http://localhost:3000/categories")
            .then(response => response.json())
            .then(categories => {
                const addDropdown = document.getElementById("productCategory");
                const editDropdown = document.getElementById("editProductCategory");
                
                // Clear existing options
                addDropdown.innerHTML = '<option value="">Select Category</option>';
                editDropdown.innerHTML = '<option value="">Select Category</option>';
                
                console.log('Loading categories:', categories);
                categories.forEach(category => {
                    // Add to new product dropdown
                    const addOption = document.createElement("option");
                    addOption.value = category.id;
                    addOption.textContent = category.name;
                    addDropdown.appendChild(addOption);
                    
                    // Add to edit product dropdown
                    const editOption = document.createElement("option");
                    editOption.value = category.id;
                    editOption.textContent = category.name;
                    editDropdown.appendChild(editOption);
                });
            })
            .catch(err => console.error("Error loading categories:", err));
    }

    // Add event listener for edit form
    document.getElementById("editProductForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const productId = document.getElementById("editProductId").value;
        const formData = new FormData();
        const name = document.getElementById("editProductTitle").value;
        const price = document.getElementById("editProductPrice").value;
        const description = document.getElementById("editProductDescription").value;
        const categoryId = document.getElementById("editProductCategory").value;
        const quantity = document.getElementById("editProductQuantity").value;
        const image = document.getElementById("editProductImage").files[0];

        // Validate non-negative numbers
        if (parseFloat(price) < 0 || parseInt(quantity) < 0) {
            alert("Price and quantity cannot be negative!");
            return;
        }

        console.log('Updating product:', { id: productId, name, price, description, categoryId, quantity });

        formData.append("name", name);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("categoryId", categoryId);
        formData.append("quantity", quantity);
        if (image) formData.append("image", image);

        fetch(`http://localhost:3000/products/${productId}`, {
            method: 'PUT',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            alert("Product updated successfully!");
            const editProductModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
            editProductModal.hide();
            document.getElementById("editProductForm").reset();
            loadProducts();
        })
        .catch(err => {
            console.error('Error:', err);
            alert("Error updating product");
        });
    });
});

// Edit product
function openEditProductForm(product) {
    console.log('Opening edit form for product:', product);
    document.getElementById("editProductId").value = product.id;
    document.getElementById("editProductTitle").value = product.name || '';
    document.getElementById("editProductPrice").value = product.price || '';
    document.getElementById("editProductCategory").value = product.categoryId || '';
    document.getElementById("editProductDescription").value = product.description || '';
    document.getElementById("editProductQuantity").value = product.quantity || 0;
    
    const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    editProductModal.show();
}

// Delete product
function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        console.log('Deleting product:', id);
        fetch(`http://localhost:3000/products/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            alert("Product deleted successfully!");
            loadProducts();
        })
        .catch(err => {
            console.error('Error:', err);
            alert("Error deleting product");
        });
    }
} 