document.getElementById("addProductForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Get product data
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const quantity = parseInt(document.getElementById("productQuantity").value);
    const category = document.getElementById("productCategory").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const imageFile = document.getElementById("productImage").files[0];

    let formValid = true;

    // Clear previous error messages
    document.querySelectorAll(".error-message").forEach(function (errorElement) {
        errorElement.classList.add("d-none");
    });

    // Input validation
    if (!name) {
        formValid = false;
        document.getElementById("productNameError").classList.remove("d-none");
    }

    if (price <= 0) {
        formValid = false;
        document.getElementById("productPriceError").classList.remove("d-none");
    }

    if (quantity <= 0) {
        formValid = false;
        document.getElementById("productQuantityError").classList.remove("d-none");
    }

    if (!category) {
        formValid = false;
        document.getElementById("productCategoryError").classList.remove("d-none");
    }

    if (!description) {
        formValid = false;
        document.getElementById("productDescriptionError").classList.remove("d-none");
    }

    if (!imageFile) {
        formValid = false;
        document.getElementById("productImageError").classList.remove("d-none");
    }

    if (!formValid) return;

    // Convert the image to base64 string
    const reader = new FileReader();
    reader.onloadend = function () {
        const product = {
            id: Date.now(), // unique ID
            name,
            price,
            quantity,
            category,
            description,
            image: reader.result // base64 encoded image
        };

        // Get existing products or empty array
        const products = JSON.parse(localStorage.getItem("products")) || [];

        // Add new product
        products.push(product);

        // Save back to localStorage
        localStorage.setItem("products", JSON.stringify(products));

        // Show success message
        document.getElementById("successMessage").classList.remove("d-none");

        // Reset form
        document.getElementById("addProductForm").reset();

        // Update product count in Admin Dashboard
        updateAdminDashboard();
    };

    // Read the image file as a data URL (base64 string)
    reader.readAsDataURL(imageFile);
});
