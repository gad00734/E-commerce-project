// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (!isAdmin()) {
        window.location.href = 'index.html';
        return;
    }
    loadProducts();
    loadCategories();
    setupEventListeners();
});

// Check if user is admin
function isAdmin() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    return loggedInUser && loggedInUser.role === 'admin';
}

// Setup event listeners
function setupEventListeners() {
    // Product image input change handler
    document.getElementById('productImage').addEventListener('change', handleImageSelect);

    // Save product button click handler
    document.getElementById('saveProductBtn').addEventListener('click', saveProduct);

    // Product form reset handler
    document.getElementById('productModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('modalTitle').textContent = 'Add New Product';
        document.getElementById('imagePreviewContainer').style.display = 'none';
        document.getElementById('imagePreview').src = '';
    });

    // Logout button handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    });
}

// Handle image selection
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        // Check file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file');
            event.target.value = '';
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size should be less than 5MB');
            event.target.value = '';
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            document.getElementById('imagePreviewContainer').style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById('imagePreviewContainer').style.display = 'none';
    }
}

// Save product
async function saveProduct() {
    try {
        const form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const productId = document.getElementById('productId').value;
        const imageFile = document.getElementById('productImage').files[0];
        
        if (!imageFile && !productId) {
            showToast('Please select an image');
            return;
        }

        // Convert image to base64
        let imageUrl = '';
        if (imageFile) {
            imageUrl = await convertImageToBase64(imageFile);
        } else {
            // If editing and no new image selected, keep the existing image
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const existingProduct = products.find(p => p.id === productId);
            if (existingProduct) {
                imageUrl = existingProduct.image;
            }
        }

        const product = {
            id: productId || Date.now().toString(),
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            category: document.getElementById('productCategory').value,
            image: imageUrl
        };

        saveProductToStorage(product);

        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        showToast(productId ? 'Product updated successfully' : 'Product added successfully');
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Error saving product');
    }
}

// Convert image to base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Load products
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('productsTableBody');
    const productCount = document.getElementById('productCount');
    
    if (productCount) {
        productCount.textContent = products.length;
    }
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No products found</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.image || ''}" alt="${product.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                     onerror="this.src='images/placeholder.jpg'">
            </td>
            <td>${product.name || ''}</td>
            <td>${product.category || ''}</td>
            <td>$${(product.price || 0).toFixed(2)}</td>
            <td>${product.stock || 0}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editProduct('${product.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load categories for dropdown
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const categorySelect = document.getElementById('productCategory');
    
    if (!categorySelect) return;
    
    categorySelect.innerHTML = `
        <option value="">Select Category</option>
        ${categories.map(category => `
            <option value="${category.id}">${category.name}</option>
        `).join('')}
    `;
}

// Edit product
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showToast('Product not found');
        return;
    }

    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productStock').value = product.stock || '';
    document.getElementById('productCategory').value = product.categoryId || '';

    if (product.image) {
        document.getElementById('imagePreview').src = product.image;
        document.getElementById('imagePreviewContainer').style.display = 'block';
    }

    document.getElementById('modalTitle').textContent = 'Edit Product';
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const updatedProducts = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        loadProducts();
        showToast('Product deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product');
    }
}

// Save product to storage
function saveProductToStorage(product) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const index = products.findIndex(p => p.id === product.id);
    
    if (index !== -1) {
        products[index] = { ...products[index], ...product };
    } else {
        products.push(product);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
}

// Show toast notification
function showToast(message) {
    const toastEl = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastEl);
    document.getElementById('toast-message').textContent = message;
    toast.show();
} 