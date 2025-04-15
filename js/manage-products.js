// Function to save products to localStorage
function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

// Function to get products from localStorage
function getProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

// Initialize products array
let products = [];

// Load categories from server
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3000/categories');
        const categories = await response.json();
        
        // Populate both add and edit form category dropdowns
        const addCategorySelect = document.getElementById('productCategory');
        const editCategorySelect = document.getElementById('editProductCategory');
        
        [addCategorySelect, editCategorySelect].forEach(select => {
            select.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(category => {
                select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        });
    } catch (error) {
        showToast('Error loading categories: ' + error.message, 'error');
    }
}

// Display products in table
async function displayProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        products = await response.json();
        
        const tbody = document.getElementById('productsList');
        tbody.innerHTML = '';
        
        products.forEach(product => {
            tbody.innerHTML += `
                <tr>
                    <td>${product.id}</td>
                    <td><img src="${product.image}" alt="${product.name}" class="product-thumbnail" onerror="this.src='images/placeholder.jpg'"></td>
                    <td>${product.name}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.categoryId}</td>
                    <td>${product.quantity}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="openEditForm(${product.id})">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        showToast('Error loading products: ' + error.message, 'error');
    }
}

// Add new product
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('productTitle').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('categoryId', document.getElementById('productCategory').value);
    formData.append('quantity', document.getElementById('productQuantity').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('image', document.getElementById('productImage').files[0]);

    try {
        const response = await fetch('http://localhost:3000/products', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to add product');
        }

        showToast('Product added successfully!', 'success');
        e.target.reset();
        await displayProducts();
    } catch (error) {
        showToast('Error adding product: ' + error.message, 'error');
    }
});

// Open edit form with product data
function openEditForm(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductTitle').value = product.name;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductCategory').value = product.categoryId;
        document.getElementById('editProductQuantity').value = product.quantity;
        document.getElementById('editProductDescription').value = product.description;
        
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    }
}

// Handle edit product form submission
document.getElementById('editProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const formData = new FormData();
    formData.append('name', document.getElementById('editProductTitle').value);
    formData.append('price', document.getElementById('editProductPrice').value);
    formData.append('categoryId', document.getElementById('editProductCategory').value);
    formData.append('quantity', document.getElementById('editProductQuantity').value);
    formData.append('description', document.getElementById('editProductDescription').value);
    
    const imageFile = document.getElementById('editProductImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch(`http://localhost:3000/products/${productId}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update product');
        }

        showToast('Product updated successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
        await displayProducts();
    } catch (error) {
        showToast('Error updating product: ' + error.message, 'error');
    }
});

// Delete product
async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`http://localhost:3000/products/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            showToast('Product deleted successfully!', 'success');
            await displayProducts();
        } catch (error) {
            showToast('Error deleting product: ' + error.message, 'error');
        }
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    displayProducts();
}); 