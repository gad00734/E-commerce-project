
// رابط API Fake Store
const apiUrl = '../data/data.json';

// دالة لعرض المنتجات
async function getProducts() {
    try {
        // جلب البيانات من الـ API
        const response = await fetch(apiUrl);
        const products = await response.json();

        // تحديد المكان الذي سيتم عرض المنتجات فيه
        const productList = document.getElementById('product-list');

        // تكرار المنتجات لعرضها في الـ HTML
        products.forEach(product => {
            // إنشاء كارد لكل منتج
            const productCard = document.createElement('div');
            productCard.classList.add('col-lg-3', 'col-md-6', 'mb-4');
            productCard.innerHTML = `
                <div class="product-card card h-100 shadow-sm border-0">
                    <img src="${product.image}" class="card-img-top" alt="${product.title}">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold">${product.title}</h5>
                        <p class="card-text text-muted">$${product.price}</p>
                        <a href="#" class="btn btn-primary btn-sm rounded-pill">View Details</a>
                    </div>
                </div>
            `;
            // إضافة الكارد إلى الـ HTML
            productList.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// استدعاء الدالة لتحميل المنتجات عند تحميل الصفحة
getProducts();
