const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, "data.json");

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

app.get('/manage-categories.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'manage-categories.html'));
});

// GET 
app.get("/categories", (req, res) => {
    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read data" });

        const fileData = JSON.parse(data);
        const categories = fileData.categories || [];
        res.json(categories);
    });
});

// POST
app.post("/categories", upload.single('image'), (req, res) => {
    const { name } = req.body;
    const image = req.file ? `/img/${req.file.filename}` : null;

    if (!name || !image) return res.status(400).json({ error: "Category name and image are required" });

    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file" });

        let fileData = JSON.parse(data);

        const existingCategory = fileData.categories.find(c => c.name === name);
        if (existingCategory) {
            return res.status(409).json({ error: "Category already exists" });
        }

        const newCategory = {
            id: fileData.categories.length + 1,
            name: name,
            image: image
        };

        fileData.categories.push(newCategory);

        fs.writeFile(dataFilePath, JSON.stringify(fileData, null, 2), err => {
            if (err) return res.status(500).json({ error: "Failed to write file" });
            res.json({ success: true, category: newCategory });
        });
    });
});

// Edit 
app.put("/categories/:id", upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name } = req.body; 
    const image = req.file ? `/img/${req.file.filename}` : null; 

    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file" });

        let fileData = JSON.parse(data);

        const category = fileData.categories.find(c => c.id === parseInt(id));
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        if (name && name !== category.name) {
            category.name = name;
        }

        if (image) {
            category.image = image;
        }

        fs.writeFile(dataFilePath, JSON.stringify(fileData, null, 2), err => {
            if (err) return res.status(500).json({ error: "Failed to write file" });
            res.json({ success: true, category });
        });
    });
});

// DELETE 
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
