// Check admin authentication
function checkAdminAuth() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || loggedInUser.role !== 'admin') {
        window.location.href = 'index.html';
    }
    document.getElementById('adminName').textContent = loggedInUser.email.split('@')[0];
}

// Initialize page
async function initializePage() {
    checkAdminAuth();
    await loadCategories();
    setupEventListeners();
}

// Load categories
async function loadCategories() {
    try {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const tbody = document.getElementById('categoriesTableBody');
        tbody.innerHTML = '';

        if (categories.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No categories found</td>
                </tr>`;
            return;
        }

        categories.forEach(category => {
            const productCount = products.filter(p => p.categoryId === category.id).length;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        ${category.image ? `
                            <img src="${category.image}" alt="${category.name}" 
                                 style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 10px;"
                                 onerror="this.src='images/placeholder.jpg'">
                        ` : ''}
                        ${category.name}
                    </div>
                </td>
                <td>${category.description || ''}</td>
                <td>${productCount}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-2" onclick="editCategory(${category.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showToast('Error loading categories');
        console.error('Error loading categories:', error);
    }
}

// Add new category
async function addCategory(event) {
    event.preventDefault();
    try {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const newCategory = {
            id: Date.now(),
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value,
            image: ''  // Will be updated if image is provided
        };

        // Handle image if provided
        const imageFile = document.getElementById('categoryImage')?.files[0];
        if (imageFile) {
            newCategory.image = await toBase64(imageFile);
        }

        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        
        document.getElementById('addCategoryForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
        
        await loadCategories();
        showToast('Category added successfully');
    } catch (error) {
        showToast('Error adding category');
        console.error('Error adding category:', error);
    }
}

// Edit category
function editCategory(categoryId) {
    try {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        document.getElementById('editCategoryId').value = category.id;
        document.getElementById('editCategoryName').value = category.name;
        document.getElementById('editCategoryDescription').value = category.description;
        // Product count
        const productCount = products.filter(p => p.categoryId === category.id).length;
        const productCountField = document.getElementById('editCategoryProductCount');
        if (productCountField) {
            productCountField.value = productCount;
        }
        // Image preview
        const previewContainer = document.getElementById('editCategoryImagePreviewContainer');
        const previewImg = document.getElementById('editCategoryImagePreview');
        if (category.image) {
            previewImg.src = category.image;
            previewContainer.style.display = 'block';
        } else {
            previewContainer.style.display = 'none';
        }
        document.getElementById('editCategoryImage').value = '';
        new bootstrap.Modal(document.getElementById('editCategoryModal')).show();
    } catch (error) {
        showToast('Error loading category details');
        console.error('Error loading category details:', error);
    }
}

// Image preview for edit modal
if (document.getElementById('editCategoryImage')) {
    document.getElementById('editCategoryImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const previewContainer = document.getElementById('editCategoryImagePreviewContainer');
        const previewImg = document.getElementById('editCategoryImagePreview');
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                previewImg.src = evt.target.result;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewContainer.style.display = 'none';
        }
    });
}

// Update category
async function updateCategory(event) {
    event.preventDefault();
    try {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const categoryId = parseInt(document.getElementById('editCategoryId').value);
        const categoryIndex = categories.findIndex(c => c.id === categoryId);

        if (categoryIndex === -1) {
            showToast('Category not found');
            return;
        }

        // Handle image update
        const imageFile = document.getElementById('editCategoryImage').files[0];
        let image = categories[categoryIndex].image;
        if (imageFile) {
            image = await toBase64(imageFile);
        }

        categories[categoryIndex] = {
            id: categoryId,
            name: document.getElementById('editCategoryName').value,
            description: document.getElementById('editCategoryDescription').value,
            image: image
        };

        localStorage.setItem('categories', JSON.stringify(categories));
        bootstrap.Modal.getInstance(document.getElementById('editCategoryModal')).hide();
        await loadCategories();
        showToast('Category updated successfully');
    } catch (error) {
        showToast('Error updating category');
        console.error('Error updating category:', error);
    }
}

// Helper function to convert file to base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Delete category
async function deleteCategory(categoryId) {
    try {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const hasProducts = products.some(p => p.categoryId === categoryId);

        if (hasProducts) {
            showToast('Cannot delete category with associated products');
            return;
        }

        if (!confirm('Are you sure you want to delete this category?')) return;

        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const updatedCategories = categories.filter(c => c.id !== categoryId);
        localStorage.setItem('categories', JSON.stringify(updatedCategories));
        
        await loadCategories();
        showToast('Category deleted successfully');
    } catch (error) {
        showToast('Error deleting category');
        console.error('Error deleting category:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('saveCategoryBtn').addEventListener('click', addCategory);
    document.getElementById('updateCategoryBtn').addEventListener('click', updateCategory);
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    });
}

// Show toast notification
function showToast(message) {
    const toastEl = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastEl);
    document.getElementById('toast-message').textContent = message;
    toast.show();
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 