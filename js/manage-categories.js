document.addEventListener("DOMContentLoaded", function() {
    const addCategoryForm = document.getElementById("addCategoryForm");
    const categoryList = document.getElementById("categoryList");
  
    loadCategories();
  
    // Add category
    addCategoryForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const categoryName = document.getElementById("newCategory").value;
        const categoryImageFile = document.getElementById("newCategoryImage").files[0];
        let image = '';
        if (categoryImageFile) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                image = evt.target.result;
                saveCategory();
            };
            reader.readAsDataURL(categoryImageFile);
        } else {
            saveCategory();
        }
        function saveCategory() {
            const categories = JSON.parse(localStorage.getItem('categories')) || [];
            const newCategory = {
                id: Date.now().toString(),
                name: categoryName,
                image: image
            };
            categories.push(newCategory);
            localStorage.setItem('categories', JSON.stringify(categories));
            loadCategories();
            addCategoryForm.reset();
        }
    });
  
    // Load categories
    function loadCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        categoryList.innerHTML = "";
        if (categories.length === 0) {
            categoryList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No categories found</td>
                </tr>`;
            return;
        }
        categories.forEach(category => {
            const row = document.createElement("tr");
            const productCount = products.filter(p => p.category === category.name).length;
            row.innerHTML = `
                <td>${category.id || ''}</td>
                <td>${category.name}</td>
                <td><img src="${category.image || 'images/placeholder.jpg'}" alt="${category.name}" style="width:50px;height:50px;" onerror="this.src='images/placeholder.jpg'" /></td>
                <td>${productCount}</td>
                <td>
                    <button class="btn btn-warning me-2" onclick='openEditCategoryForm("${category.id}")'><i class="bi bi-pencil"></i> Edit</button>
                    <button class="btn btn-danger" onclick='deleteCategory("${category.id}")'><i class="bi bi-trash"></i> Delete</button>
                </td>
            `;
            categoryList.appendChild(row);
        });
    }
  
    window.openEditCategoryForm = function(categoryId) {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const category = categories.find(c => c.id === categoryId);
        if (!category) return;
        document.getElementById("editCategoryId").value = category.id;
        document.getElementById("editCategoryName").value = category.name;
        // No image preview for edit for simplicity
        const editCategoryModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
        editCategoryModal.show();
    };
  
    document.getElementById("editCategoryForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const categoryId = document.getElementById("editCategoryId").value;
        const categoryName = document.getElementById("editCategoryName").value;
        const categoryImageFile = document.getElementById("editCategoryImage").files[0];
        let categories = JSON.parse(localStorage.getItem('categories')) || [];
        let category = categories.find(c => c.id === categoryId);
        function updateCategory(image) {
            category.name = categoryName;
            if (image) category.image = image;
            localStorage.setItem('categories', JSON.stringify(categories));
            loadCategories();
            const editCategoryModal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
            editCategoryModal.hide();
            document.getElementById("editCategoryForm").reset();
        }
        if (categoryImageFile) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                updateCategory(evt.target.result);
            };
            reader.readAsDataURL(categoryImageFile);
        } else {
            updateCategory();
        }
    });
  
    window.deleteCategory = function(id) {
        if (confirm("Are you sure you want to delete this category?")) {
            let categories = JSON.parse(localStorage.getItem('categories')) || [];
            categories = categories.filter(c => c.id !== id);
            localStorage.setItem('categories', JSON.stringify(categories));
            loadCategories();
        }
    };
});
  