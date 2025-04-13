document.addEventListener("DOMContentLoaded", () => {
    loadCategoriesToDropdown();
    // Other functions like getProducts() can go here
  });
  
  async function loadCategoriesToDropdown() {
    try {
      const res = await fetch("http://localhost:3000/categories");
      const categories = await res.json();
      const dropdown = document.getElementById("categoryFilter");
  
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.name;
        option.textContent = cat.name;
        dropdown.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

  document.getElementById("categoryFilter").addEventListener("change", (e) => {
    const selectedCategory = e.target.value;
  
    // Call your getProducts() or filtering logic here
    if (selectedCategory === "all") {
      getProducts(); // Load all
    } else {
      getProductsByCategory(selectedCategory);
    }
  });
  
  // Example filtering function (depends on your product API structure)
  async function getProductsByCategory(category) {
    try {
      const res = await fetch(`http://localhost:3000/products?category=${category}`);
      const products = await res.json();
      renderProducts(products); // a function that renders them in productGrid
    } catch (err) {
      console.error("Error fetching products by category:", err);
    }
  }
  