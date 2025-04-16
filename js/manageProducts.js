document.addEventListener("DOMContentLoaded", function () {
    const productList = document.getElementById("productList");
    const productCount = document.getElementById("productCount");
    const addProductForm = document.getElementById("addProductForm");
    const editProductForm = document.getElementById("editProductForm");
    const addProductCategory = document.getElementById("addProductCategory");
    const editProductCategory = document.getElementById("editProductCategory");

    // Populate category dropdowns
    function populateCategoryDropdowns(selectedCategory = null) {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        // Helper to build options
        function buildOptions(selectElem, selected) {
            selectElem.innerHTML = '';
            if (categories.length === 0) {
                selectElem.innerHTML = '<option value="" disabled>No categories available</option>';
                selectElem.disabled = true;
            } else {
                selectElem.disabled = false;
                selectElem.innerHTML = '<option value="">Select Category</option>' +
                    categories.map(cat => `<option value="${cat.name}"${selected === cat.name ? ' selected' : ''}>${cat.name}</option>`).join('');
            }
        }
        buildOptions(addProductCategory, null);
        buildOptions(editProductCategory, selectedCategory);
    }

    // Image preview handlers
    document.getElementById('addProductImage').addEventListener('change', function(e) {
        handleImagePreview(e, 'addImagePreview', 'addImagePreviewContainer');
    });
    document.getElementById('editProductImage').addEventListener('change', function(e) {
        handleImagePreview(e, 'editImagePreview', 'editImagePreviewContainer');
    });

    loadProducts();
    populateCategoryDropdowns();

    // Load products from localStorage
    function loadProducts() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        productList.innerHTML = "";
        productCount.textContent = products.length;
        products.forEach((product, idx) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.quantity}</td>
                <td>${product.category || ''}</td>
                <td><img src="${product.image || ''}" style="width:50px;height:50px;"></td>
                <td>
                    <button class="btn btn-warning btn-sm me-2" onclick='openEditProductModal(${idx})'>Edit</button>
                    <button class="btn btn-danger btn-sm" onclick='deleteProduct(${idx})'>Delete</button>
                </td>
            `;
            productList.appendChild(row);
        });
    }

    // Add product
    addProductForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById("addProductName").value;
        const price = document.getElementById("addProductPrice").value;
        const quantity = document.getElementById("addProductQuantity").value;
        const category = addProductCategory.value;
        const imageFile = document.getElementById("addProductImage").files[0];
        let image = '';
        if (imageFile) {
            image = await toBase64(imageFile);
        }
        const products = JSON.parse(localStorage.getItem('products')) || [];
        products.push({ name, price, quantity, category, image });
        localStorage.setItem('products', JSON.stringify(products));
        addProductForm.reset();
        document.getElementById('addImagePreviewContainer').style.display = 'none';
        loadProducts();
        bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
    });

    // Open edit modal with product data
    window.openEditProductModal = function(idx) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products[idx];
        document.getElementById('editProductIndex').value = idx;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductQuantity').value = product.quantity;
        // Populate categories and select the current one
        populateCategoryDropdowns(product.category);
        document.getElementById('editProductImage').value = '';
        // Show image preview if exists
        if (product.image) {
            document.getElementById('editImagePreview').src = product.image;
            document.getElementById('editImagePreviewContainer').style.display = 'block';
        } else {
            document.getElementById('editImagePreviewContainer').style.display = 'none';
        }
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    };

    // Edit product
    editProductForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const idx = document.getElementById('editProductIndex').value;
        const name = document.getElementById('editProductName').value;
        const price = document.getElementById('editProductPrice').value;
        const quantity = document.getElementById('editProductQuantity').value;
        const category = editProductCategory.value;
        const imageFile = document.getElementById('editProductImage').files[0];
        let products = JSON.parse(localStorage.getItem('products')) || [];
        let image = products[idx].image;
        if (imageFile) {
            image = await toBase64(imageFile);
        }
        products[idx] = { name, price, quantity, category, image };
        localStorage.setItem('products', JSON.stringify(products));
        editProductForm.reset();
        document.getElementById('editImagePreviewContainer').style.display = 'none';
        loadProducts();
        bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
    });

    // Delete product
    window.deleteProduct = function (idx) {
        if (confirm('Are you sure you want to delete this product?')) {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            products.splice(idx, 1);
            localStorage.setItem('products', JSON.stringify(products));
            loadProducts();
        }
    };

    // Image preview helper
    function handleImagePreview(e, previewId, containerId) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                document.getElementById(previewId).src = evt.target.result;
                document.getElementById(containerId).style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            document.getElementById(containerId).style.display = 'none';
        }
    }

    // Convert image file to base64
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Example: Add a demo product if none exist (for testing)
    if ((JSON.parse(localStorage.getItem('products')) || []).length === 0) {
        localStorage.setItem('products', JSON.stringify([
            { name: 'Sample Product', price: 10, quantity: 5, category: 'Demo', image: '' }
        ]));
        loadProducts();
    }
});