document.addEventListener("DOMContentLoaded", function () {
    const productList = document.getElementById("productList");
    const productCount = document.getElementById("productCount");
    const addProductForm = document.getElementById("addProductForm");

    loadCategories();
    loadProducts();

    // تحميل الفئات
    function loadCategories() {
        fetch('/categories')
            .then(res => res.text())
            .then(data => JSON.parse(data))
            .then(data => {
                const categorySelect = document.getElementById('productCategory');
                if (!categorySelect) return console.error('عنصر اختيار الفئة غير موجود');
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            })
            .catch(err => console.error("خطأ في تحميل الفئات:", err));
    }

    // إضافة منتج
    if (addProductForm) {
        addProductForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("newProductName").value;
            const price = document.getElementById("newProductPrice").value;
            const categoryId = document.getElementById("productCategory").value;
            const quantity = document.getElementById("newProductQuantity").value;
            const description = document.getElementById("newProductDescription").value;
            const image = document.getElementById("newProductImage").files[0];

            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            formData.append("categoryId", categoryId);
            formData.append("quantity", quantity);
            formData.append("description", description);
            if (image) formData.append("image", image);

            fetch("http://localhost:3000/products", {
                method: "POST",
                body: formData
            })
                .then(res => res.json())
                .then(() => {
                    alert("تمت إضافة المنتج بنجاح!");
                    loadProducts();
                })
                .catch(err => {
                    console.error("خطأ في إضافة المنتج:", err);
                    alert("حدث خطأ أثناء إضافة المنتج");
                });
        });
    }

    // تحميل المنتجات
    function loadProducts() {
        fetch("http://localhost:3000/products")
            .then(res => res.json())
            .then(data => {
                productList.innerHTML = "";
                productCount.textContent = data.length;

                data.forEach(product => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.price}</td>
                        <td>${product.quantity}</td>
                        <td>${product.description}</td>
                        <td><img src="${product.image}" style="width:50px;height:50px;"></td>
                        <td>
                            <button class="btn btn-warning me-2" onclick='openEditProductForm(${JSON.stringify(product)})'>تعديل</button>
                            <button class="btn btn-danger" onclick='deleteProduct(${product.id})'>حذف</button>
                        </td>
                    `;
                    productList.appendChild(row);
                });
            })
            .catch(err => console.error("خطأ في تحميل المنتجات:", err));
    }

    // تعديل المنتج
    window.openEditProductForm = function (product) {
        document.getElementById("editProductId").value = product.id;
        document.getElementById("editProductName").value = product.name;
        document.getElementById("editProductPrice").value = product.price;
        document.getElementById("editProductCategory").value = product.categoryId;
        document.getElementById("editProductQuantity").value = product.quantity;
        document.getElementById("editProductDescription").value = product.description;

        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    };

    const editProductForm = document.getElementById("editProductForm");
    if (editProductForm) {
        editProductForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const id = document.getElementById("editProductId").value;
            const name = document.getElementById("editProductName").value;
            const price = document.getElementById("editProductPrice").value;
            const categoryId = document.getElementById("editProductCategory").value;
            const quantity = document.getElementById("editProductQuantity").value;
            const description = document.getElementById("editProductDescription").value;
            const image = document.getElementById("editProductImage").files[0];

            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            formData.append("categoryId", categoryId);
            formData.append("quantity", quantity);
            formData.append("description", description);
            if (image) formData.append("image", image);

            fetch("http://localhost:3000/products/${id}", {
                method: "PUT",
                body: formData
            })
                .then(res => res.json())
                .then(() => {
                    alert("تم تحديث المنتج بنجاح!");
                    loadProducts();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
                    modal.hide();
                })
                .catch(err => {
                    console.error("خطأ في تعديل المنتج:", err);
                    alert("حدث خطأ أثناء تحديث المنتج");
                });
        });
    }

    // حذف المنتج
    window.deleteProduct = function (id) {
        if (confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟")) {
            fetch("http://localhost:3000/products/${id}", {
                method: "DELETE"
            })
                .then(res => res.json())
                .then(() => {
                    alert("تم حذف المنتج بنجاح!");
                    loadProducts();
                })
                .catch(err => {
                    console.error("خطأ في حذف المنتج:", err);
                    alert("حدث خطأ أثناء حذف المنتج");
                });
        }
    };
});