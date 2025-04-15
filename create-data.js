const fs = require('fs');
const path = require('path');

const initialData = {
  "products": [
    {
      "id": 1,
      "name": "Nike T-shirt",
      "price": 300,
      "categoryId": "1",
      "quantity": 1,
      "description": "nike tshirt",
      "image": "/img/1744675413819.jpg"
    },
    {
      "id": 2,
      "name": "iphone 14",
      "price": 1500,
      "categoryId": "2",
      "quantity": 1,
      "description": "iphone 14",
      "image": "/img/1744675817003.jpg"
    },
    {
      "id": 3,
      "name": "iphone 15",
      "price": 2000,
      "categoryId": "2",
      "quantity": 6,
      "description": "ip 15",
      "image": "/img/1744676496288.jpg"
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "Men's Fashions",
      "image": "/img/1744673763964.jpg"
    },
    {
      "id": 2,
      "name": "Electronics",
      "image": "/img/1744673784514.png"
    },
    {
      "id": 3,
      "name": "Women's fashion",
      "image": "/img/1744679516194.jpg"
    }
  ]
};

const filePath = path.join(__dirname, 'data.json');

try {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
    console.log('Successfully created data.json');
} catch (error) {
    console.error('Error creating data.json:', error);
} 