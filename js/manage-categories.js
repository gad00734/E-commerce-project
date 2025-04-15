document.addEventListener("DOMContentLoaded", function() {
    const addCategoryForm = document.getElementById("addCategoryForm");
    const categoryList = document.getElementById("categoryList");
  
    loadCategories();
  
    // Add category
    addCategoryForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const categoryName = document.getElementById("newCategory").value;
        const categoryImage = document.getElementById("newCategoryImage").files[0];
  
        const formData = new FormData();
        formData.append("name", categoryName);
        formData.append("image", categoryImage);
  
        fetch("http://localhost:3000/categories", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert("Category added successfully!");
            loadCategories(); 
            addCategoryForm.reset(); // Clear the form
        })
        .catch(err => alert("Error adding category"));
    });
  
    // Load categories
    function loadCategories() {
        fetch("http://localhost:3000/categories")
            .then(response => response.json())
            .then(data => {
                categoryList.innerHTML = ""; 
                data.forEach(category => {
                    const row = document.createElement("tr");
  
                    const idCell = document.createElement("td");
                    idCell.textContent = category.id;
                    row.appendChild(idCell);
  
                    const nameCell = document.createElement("td");
                    nameCell.textContent = category.name;
                    row.appendChild(nameCell);
  
                    const imageCell = document.createElement("td");
                    const img = document.createElement("img");
                    img.src = category.image;
                    img.alt = category.name;
                    img.style.width = "50px";
                    img.style.height = "50px";
                    imageCell.appendChild(img);
                    row.appendChild(imageCell);
  
                    const actionsCell = document.createElement("td");
                    const editBtn = document.createElement("button");
                    editBtn.classList.add("btn", "btn-warning", "me-2");
                    editBtn.textContent = "Edit";
                    editBtn.onclick = () => openEditCategoryForm(category);
                    actionsCell.appendChild(editBtn);
  
                    const deleteBtn = document.createElement("button");
                    deleteBtn.classList.add("btn", "btn-danger");
                    deleteBtn.textContent = "Delete";
                    deleteBtn.onclick = () => deleteCategory(category.id);
                    actionsCell.appendChild(deleteBtn);
  
                    row.appendChild(actionsCell);
                    categoryList.appendChild(row);
                });
            })
            .catch(err => console.error("Error loading categories:", err));
    }
  
    function openEditCategoryForm(category) {
        document.getElementById("editCategoryId").value = category.id;
        document.getElementById("editCategoryName").value = category.name;
        const editCategoryModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
        editCategoryModal.show();
    }
  
    // Edit 
    document.getElementById("editCategoryForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const categoryId = document.getElementById("editCategoryId").value;
        const categoryName = document.getElementById("editCategoryName").value;
        const categoryImage = document.getElementById("editCategoryImage").files[0];
  
        const formData = new FormData();
        formData.append("name", categoryName);
        if (categoryImage) formData.append("image", categoryImage);
  
        fetch(`http://localhost:3000/categories/${categoryId}`, {
            method: "PUT",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert("Category updated successfully!");
            loadCategories(); 
            const editCategoryModal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
            editCategoryModal.hide();
            document.getElementById("editCategoryForm").reset(); // Clear the form
        })
        .catch(err => alert("Error updating category"));
    });
  
    // Delete
    function deleteCategory(id) {
        if (confirm("Are you sure you want to delete this category?")) {
            fetch(`http://localhost:3000/categories/${id}`, {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(data => {
                alert("Category deleted successfully!");
                loadCategories(); 
            })
            .catch(err => alert("Error deleting category"));
        }
    }
});
  