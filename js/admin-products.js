// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (!isAdmin()) {
            window.location.href = 'index.html';
            return;
        }
        loadProducts();
        loadCategories();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing page:', error);
        showToast('Error initializing page');
    }
});

// Check if user is admin
function isAdmin() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    return loggedInUser && loggedInUser.role === 'admin';
}

// Setup event listeners
function setupEventListeners() {
    try {
        // Add Product Modal Open handler
        const addProductBtn = document.querySelector('[data-bs-target="#productModal"]');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                loadCategories();
                const form = document.getElementById('productForm');
                if (form) {
                    form.reset();
                    delete form.dataset.productId;
                }
                const imagePreview = document.getElementById('imagePreview');
                if (imagePreview) {
                    imagePreview.style.display = 'none';
                }
            });
        }

        // Edit Product Modal Open handler
        const editProductModal = document.getElementById('editProductModal');
        if (editProductModal) {
            editProductModal.addEventListener('show.bs.modal', () => {
                loadCategories(); // Reload categories when opening edit modal
            });
        }

        // Add Product form submit handler
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', saveProduct);
        }

        // Edit Product form submit handler
        const editProductForm = document.getElementById('editProductForm');
        if (editProductForm) {
            editProductForm.addEventListener('submit', saveProduct);
        }

        // Image preview handlers
        const productImage = document.getElementById('productImage');
        if (productImage) {
            productImage.addEventListener('change', function(e) {
                handleImagePreview(e, 'imagePreview', 'previewImage');
            });
        }

        const editProductImage = document.getElementById('editProductImage');
        if (editProductImage) {
            editProductImage.addEventListener('change', function(e) {
                handleImagePreview(e, 'editImagePreview', 'editPreviewImage');
            });
        }

        // Price validation
        const priceInput = document.getElementById('productPrice');
        if (priceInput) {
            priceInput.setAttribute('min', '0.01');
            priceInput.setAttribute('step', '0.01');
            priceInput.addEventListener('input', function(e) {
                const value = parseFloat(e.target.value);
                if (isNaN(value) || value <= 0) {
                    e.target.setCustomValidity('Price must be greater than 0');
                    e.target.value = '';
                } else {
                    e.target.setCustomValidity('');
                }
            });

            // Prevent negative values on keydown
            priceInput.addEventListener('keydown', function(e) {
                if (e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                }
            });
        }

        // Stock validation
        const stockInput = document.getElementById('productStock');
        if (stockInput) {
            stockInput.setAttribute('min', '0');
            stockInput.setAttribute('step', '1');
            stockInput.addEventListener('input', function(e) {
                const value = parseInt(e.target.value);
                if (isNaN(value) || value < 0) {
                    e.target.setCustomValidity('Stock quantity cannot be negative');
                    e.target.value = '';
                } else {
                    e.target.setCustomValidity('');
                }
            });

            // Prevent negative values on keydown
            stockInput.addEventListener('keydown', function(e) {
                if (e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                }
            });
        }

        // Logout button handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('loggedInUser');
                window.location.href = 'index.html';
            });
        }
    } catch (error) {
        console.error('Error setting up event listeners:', error);
        showToast('Error setting up page functionality');
    }
}

// Handle image preview
function handleImagePreview(event, previewContainerId, previewImageId) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById(previewContainerId);
    const previewImage = document.getElementById(previewImageId);

    if (!previewContainer || !previewImage) {
        console.error('Preview elements not found');
        return;
    }

    if (file) {
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file');
            event.target.value = '';
            previewContainer.style.display = 'none';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewContainer.style.display = 'none';
    }
}

// Save product
function saveProduct(e) {
    try {
        // Prevent default form submission
        if (e) e.preventDefault();

        // Determine which form is being submitted
        const isEdit = document.getElementById('editProductModal').classList.contains('show');
        const formId = isEdit ? 'editProductForm' : 'productForm';
        
        console.log('Saving product, isEdit:', isEdit);

        // Get the form element
        const form = document.getElementById(formId);
        if (!form) {
            console.error('Form not found:', formId);
            showToast('Error: Form not found');
            return;
        }

        // Check form validity
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get all form elements with exact IDs from HTML
        const elements = {
            name: document.getElementById(isEdit ? 'editProductName' : 'productName'),
            description: document.getElementById(isEdit ? 'editProductDescription' : 'productDescription'),
            price: document.getElementById(isEdit ? 'editProductPrice' : 'productPrice'),
            stock: document.getElementById(isEdit ? 'editProductStock' : 'productStock'),
            category: document.getElementById(isEdit ? 'editProductCategory' : 'productCategory'),
            image: document.getElementById(isEdit ? 'editProductImage' : 'productImage')
        };

        // Debug log the elements
        console.log('Form elements:', {
            nameId: isEdit ? 'editProductName' : 'productName',
            descriptionId: isEdit ? 'editProductDescription' : 'productDescription',
            priceId: isEdit ? 'editProductPrice' : 'productPrice',
            stockId: isEdit ? 'editProductStock' : 'productStock',
            categoryId: isEdit ? 'editProductCategory' : 'productCategory',
            imageId: isEdit ? 'editProductImage' : 'productImage',
            elements: elements
        });

        // Verify all elements exist
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                const elementId = isEdit ? `editProduct${key.charAt(0).toUpperCase() + key.slice(1)}` : `product${key.charAt(0).toUpperCase() + key.slice(1)}`;
                console.error(`${key} element not found with id: ${elementId}`);
                showToast(`Error: Could not find ${key} field`);
                return;
            }
        }

        // Get form values
        const productId = form.dataset.productId || Date.now().toString();
        const price = parseFloat(elements.price.value);
        const stock = parseInt(elements.stock.value);
        const categoryId = elements.category.value;

        // Validate values
        if (isNaN(price) || price <= 0) {
            showToast('Price must be greater than 0');
            elements.price.focus();
            return;
        }

        if (isNaN(stock) || stock < 0) {
            showToast('Stock quantity cannot be negative');
            elements.stock.focus();
            return;
        }

        if (!categoryId) {
            showToast('Please select a category');
            elements.category.focus();
            return;
        }

        // Create base product object
        const productData = {
            id: productId,
            name: elements.name.value.trim(),
            description: elements.description.value.trim(),
            price: price,
            stock: stock,
            category: categoryId
        };

        console.log('Product data before save:', productData);

        // Handle image
        if (elements.image.files && elements.image.files[0]) {
            // New image being uploaded
            const reader = new FileReader();
            reader.onload = function(e) {
                productData.image = e.target.result;
                saveProductToStorage(productData);
                closeAndResetForm(isEdit);
            };
            reader.readAsDataURL(elements.image.files[0]);
        } else if (isEdit) {
            // Editing without new image - preserve existing image
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const existingProduct = products.find(p => String(p.id) === String(productId));
            productData.image = existingProduct ? existingProduct.image : '';
            saveProductToStorage(productData);
            closeAndResetForm(isEdit);
        } else {
            // New product without image
            productData.image = '';
            saveProductToStorage(productData);
            closeAndResetForm(isEdit);
        }

    } catch (error) {
        console.error('Error in saveProduct:', error);
        showToast('Error saving product');
    }
}

// Helper function to close modal and reset form
function closeAndResetForm(isEdit) {
    try {
        // Get the modal instance
        const modalId = isEdit ? 'editProductModal' : 'productModal';
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        if (modal) {
            modal.hide();
        }

        // Reset the form
        const formId = isEdit ? 'editProductForm' : 'productForm';
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }

        // Clear image preview
        const previewId = isEdit ? 'editImagePreviewContainer' : 'imagePreview';
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.style.display = 'none';
        }
    } catch (error) {
        console.error('Error closing form:', error);
    }
}

// Load products
function loadProducts() {
    try {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        console.log('Loading products:', products);
        const tableBody = document.getElementById('productList');
        const productCount = document.getElementById('productCount');
        
        if (!tableBody) {
            console.error('Product list element not found');
            return;
        }

        if (productCount) {
            productCount.textContent = products.length;
        }
        
        if (products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No products found</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = products.map(product => {
            const isOutOfStock = !product.stock || product.stock <= 0;
            const productId = String(product.id); // Ensure ID is string
            const categoryName = getCategoryName(product.category); // Get category name using our updated function
            
            return `
                <tr ${isOutOfStock ? 'class="table-danger"' : ''}>
                    <td>${product.name || ''}</td>
                    <td>$${(product.price || 0).toFixed(2)}</td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <span class="${isOutOfStock ? 'text-danger fw-bold' : ''}">${product.stock || 0}</span>
                            ${isOutOfStock ? `
                                <button class="btn btn-sm btn-warning" onclick="quickRestock('${productId}')">
                                    <i class="bi bi-plus-circle"></i> Restock
                                </button>
                            ` : ''}
                        </div>
                    </td>
                    <td>${categoryName}</td>
                    <td>
                        <img src="${product.image || './assets/images/placeholder.png'}" alt="${product.name}" 
                             style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                             onerror="this.src='./assets/images/placeholder.png'">
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2" onclick="editProduct('${productId}')">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${productId}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        const tableBody = document.getElementById('productList');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        Error loading products. Please try again.
                    </td>
                </tr>
            `;
        }
    }
}

// Load categories for dropdown
function loadCategories() {
    try {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const addCategorySelect = document.getElementById('productCategory');
        const editCategorySelect = document.getElementById('editProductCategory');
        
        if (!addCategorySelect && !editCategorySelect) {
            console.error('Category select elements not found');
            return;
        }

        const categoryOptions = `
            <option value="">Select Category</option>
            ${categories.map(category => `
                <option value="${category.id}">${category.name}</option>
            `).join('')}
        `;

        // Update both dropdowns if they exist
        if (addCategorySelect) {
            addCategorySelect.innerHTML = categoryOptions;
        }
        if (editCategorySelect) {
            editCategorySelect.innerHTML = categoryOptions;
        }

        console.log('Categories loaded:', categories.length); // Debug log
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Error loading categories');
    }
}

// Edit product
function editProduct(id) {
    try {
        console.log('Editing product with ID:', id);
        const products = JSON.parse(localStorage.getItem('products')) || [];
        console.log('All products:', products);
        
        // Convert id to string for consistent comparison
        const productId = String(id);
        const product = products.find(p => String(p.id) === productId);
        console.log('Found product:', product);
        
        if (!product) {
            console.error('Product not found with ID:', id);
            showToast('Product not found');
            return;
        }

        // Set form data
        const form = document.getElementById('editProductForm');
        form.dataset.productId = productId;
        
        document.getElementById('editProductName').value = product.name || '';
        document.getElementById('editProductDescription').value = product.description || '';
        document.getElementById('editProductPrice').value = product.price || '';
        document.getElementById('editProductStock').value = product.stock || '';
        document.getElementById('editProductCategory').value = product.category || '';

        // Show existing image preview
        const previewContainer = document.getElementById('editImagePreviewContainer');
        const previewImage = document.getElementById('editImagePreview');
        if (product.image) {
            previewImage.src = product.image;
            previewContainer.style.display = 'block';
        } else {
            previewContainer.style.display = 'none';
        }

        // Show modal
        const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
        editModal.show();
    } catch (error) {
        console.error('Error editing product:', error);
        showToast('Error loading product details');
    }
}

// Delete product
function deleteProduct(id) {
    try {
        if (!confirm('Are you sure you want to delete this product?')) return;

        const products = JSON.parse(localStorage.getItem('products')) || [];
        const updatedProducts = products.filter(p => p.id.toString() !== id.toString());
        
        if (products.length === updatedProducts.length) {
            showToast('Product not found');
            return;
        }

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
    try {
        console.log('Saving product:', product);
        const products = JSON.parse(localStorage.getItem('products')) || [];
        console.log('Existing products:', products);
        
        // Convert IDs to strings for comparison
        const productId = String(product.id);
        const index = products.findIndex(p => String(p.id) === productId);
        console.log('Found product index:', index);
        
        // Ensure product has all required fields
        const updatedProduct = {
            id: productId, // Ensure ID is stored as string
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category,
            image: product.image
        };
        
        if (index > -1) {
            // Update existing product
            products[index] = updatedProduct;
        } else {
            // Add new product
            products.push(updatedProduct);
        }
        
        console.log('Saving updated products:', products);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
        showToast(index > -1 ? 'Product updated successfully' : 'Product added successfully');
        
    } catch (error) {
        console.error('Error saving product to storage:', error);
        showToast('Error saving product');
    }
}

// Quick restock function
async function quickRestock(productId) {
    try {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id.toString() === productId.toString());
        
        if (!product) {
            console.error('Product not found:', productId);
            showToast('Product not found');
            return;
        }

        // Show prompt for restock quantity
        const quantity = prompt('Enter restock quantity:', '10');
        
        // Validate input
        if (quantity === null) return; // User cancelled
        
        const newQuantity = parseInt(quantity);
        if (isNaN(newQuantity) || newQuantity <= 0) {
            showToast('Please enter a valid quantity (greater than 0)');
            return;
        }

        // Update product stock
        product.stock = (parseInt(product.stock) || 0) + newQuantity;
        
        // Save to storage
        saveProductToStorage(product);
        
        // Refresh display
        loadProducts();
        
        showToast(`Successfully restocked ${product.name} with ${newQuantity} units`);
    } catch (error) {
        console.error('Error restocking product:', error);
        showToast('Error restocking product');
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show position-fixed bottom-0 end-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Get category name
function getCategoryName(categoryId) {
    try {
        // Return early if categoryId is empty or undefined
        if (!categoryId) {
            console.log('No category ID provided');
            return 'Uncategorized';
        }

        // Get categories from localStorage
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        
        // Convert categoryId to string for consistent comparison
        const searchId = String(categoryId);
        
        // Find the category
        const category = categories.find(c => String(c.id) === searchId);
        
        // Log for debugging
        console.log('Looking for category:', {
            searchId,
            foundCategory: category,
            allCategories: categories
        });

        // Return category name if found, otherwise return Uncategorized
        return category ? category.name : 'Uncategorized';
    } catch (error) {
        console.error('Error getting category name:', error);
        return 'Uncategorized';
    }
} 