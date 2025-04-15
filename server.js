const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, "data.json");

// Check if data.json exists, if not create it with initial structure
if (!fs.existsSync(dataFilePath)) {
    const initialData = {
        "products": [],
        "categories": []
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
    console.log('Created new data.json file with initial structure');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'img/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'img')));
app.use(cors());

// Middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve HTML pages
app.get('/manage-categories.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'manage-categories.html'));
});

app.get('/manage-products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'manage-products.html'));
});

// ======================== Categories ========================

// GET Categories
app.get("/categories", (req, res) => {
    console.log('Reading data file for categories...');
    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return res.status(500).json({ error: "Failed to read data" });
        }
        try {
            const fileData = JSON.parse(data);
            console.log('Raw file data:', fileData);
            
            if (!fileData || typeof fileData !== 'object') {
                console.error('Invalid file data structure');
                return res.status(500).json({ error: "Invalid data structure" });
            }

            const categories = Array.isArray(fileData.categories) ? fileData.categories : [];
            console.log('Sending categories:', categories);
            res.json(categories);
        } catch (error) {
            console.error('Error parsing data file:', error);
            res.status(500).json({ error: "Failed to parse data file" });
        }
    });
});

// POST Category
app.post("/categories", upload.single('image'), (req, res) => {
    const { name } = req.body;
    const image = req.file ? `/img/${req.file.filename}` : null;

    if (!name || !image) return res.status(400).json({ error: "Category name and image are required" });

    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file" });

        let fileData = JSON.parse(data);
        fileData.categories = fileData.categories || [];

        const existingCategory = fileData.categories.find(c => c.name === name);
        if (existingCategory) return res.status(409).json({ error: "Category already exists" });

        const newCategory = {
            id: fileData.categories.length + 1,
            name,
            image
        };

        fileData.categories.push(newCategory);

        fs.writeFile(dataFilePath, JSON.stringify(fileData, null, 2), err => {
            if (err) return res.status(500).json({ error: "Failed to write file" });
            res.json({ success: true, category: newCategory });
        });
    });
});

// PUT Category
app.put("/categories/:id", upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const image = req.file ? `/img/${req.file.filename}` : null;

    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file" });

        let fileData = JSON.parse(data);
        fileData.categories = fileData.categories || [];

        const category = fileData.categories.find(c => c.id === parseInt(id));
        if (!category) return res.status(404).json({ error: "Category not found" });

        if (name) category.name = name;
        if (image) category.image = image;

        fs.writeFile(dataFilePath, JSON.stringify(fileData, null, 2), err => {
            if (err) return res.status(500).json({ error: "Failed to write file" });
            res.json({ success: true, category });
        });
    });
});

// DELETE Category
app.delete("/categories/:id", (req, res) => {
    const { id } = req.params;

    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file" });

        let fileData = JSON.parse(data);
        const updatedCategories = fileData.categories.filter(c => c.id !== parseInt(id));

        if (updatedCategories.length === fileData.categories.length) {
            return res.status(404).json({ error: "Category not found" });
        }

        fileData.categories = updatedCategories;

        fs.writeFile(dataFilePath, JSON.stringify(fileData, null, 2), err => {
            if (err) return res.status(500).json({ error: "Failed to write file" });
            res.json({ success: true, message: "Category deleted" });
        });
    });
});

// ======================== Products ========================

// GET Products
app.get("/products", (req, res) => {
    console.log('Reading data file for products...');
    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return res.status(500).json({ error: "Failed to read data" });
        }
        try {
            const fileData = JSON.parse(data);
            console.log('Products data:', fileData.products);
            const products = fileData.products || [];
            res.json(products);
        } catch (error) {
            console.error('Error parsing data file:', error);
            res.status(500).json({ error: "Failed to parse data file" });
        }
    });
});

// POST Product
app.post("/products", upload.single('image'), (req, res) => {
    const { name, price, categoryId, quantity, description } = req.body;
    const image = req.file ? `/img/${req.file.filename}` : null;

    if (!name || !price || !categoryId || !quantity || !description || !image) {
        return res.status(400).json({ error: "All fields including image are required" });
    }

    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file" });

        let fileData = JSON.parse(data);
        fileData.products = fileData.products || [];

        const newProduct = {
            id: fileData.products.length ? fileData.products[fileData.products.length - 1].id + 1 : 1,
            name,
            price: parseFloat(price),
            categoryId,
            quantity: parseInt(quantity),
            description,
            image
        };

        fileData.products.push(newProduct);

        fs.writeFile(dataFilePath, JSON.stringify(fileData, null, 2), err => {
            if (err) return res.status(500).json({ error: "Failed to write file" });
            res.json({ success: true, product: newProduct });
        });
    });
});

// PUT Product
app.put("/products/:id", upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, price, categoryId, quantity, description } = req.body;
    const image = req.file ? `/img/${req.file.filename}` : null;

    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file" });

        let fileData = JSON.parse(data);
        fileData.products = fileData.products || [];

        const product = fileData.products.find(p => p.id === parseInt(id));
        if (!product) return res.status(404).json({ error: "Product not found" });

        if (name) product.name = name;
        if (price) product.price = parseFloat(price);
        if (categoryId) product.categoryId = categoryId;
        if (quantity) product.quantity = parseInt(quantity);
        if (description) product.description = description;
        if (image) product.image = image;

        fs.writeFile(dataFilePath, JSON.stringify(fileData, null, 2), err => {
            if (err) return res.status(500).json({ error: "Failed to write file" });
            res.json({ success: true, product });
        });
    });
});

// DELETE Product
app.delete("/products/:id", (req, res) => {
    const { id } = req.params;

    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file" });

        let fileData = JSON.parse(data);
        const updatedProducts = fileData.products?.filter(p => p.id !== parseInt(id));

        if (updatedProducts.length === fileData.products?.length) {
            return res.status(404).json({ error: "Product not found" });
        }

        fileData.products = updatedProducts;

        fs.writeFile(dataFilePath, JSON.stringify(fileData, null, 2), err => {
            if (err) return res.status(500).json({ error: "Failed to write file" });
            res.json({ success: true, message: "Product deleted" });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
