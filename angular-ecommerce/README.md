# Angular E-Commerce Application

This is a full-featured e-commerce application built with Angular, featuring user authentication, product management, shopping cart functionality, and admin panel.

## Features

### User Features
- **User Authentication**: Login/Register with role-based access
- **Product Browsing**: View products with search and category filtering
- **Shopping Cart**: Add/remove items, update quantities
- **Wishlist**: Save favorite products
- **Order Management**: Place orders and track their status
- **User Profile**: Manage personal information

### Admin Features
- **Product Management**: Add, edit, delete products
- **Category Management**: Manage product categories
- **Order Management**: View and update order status
- **User Management**: View user accounts

## Technology Stack

- **Frontend**: Angular 16
- **UI Framework**: Bootstrap 5
- **State Management**: RxJS BehaviorSubject
- **Data Storage**: localStorage (client-side)
- **Routing**: Angular Router
- **Forms**: Angular Reactive Forms & Template-driven Forms

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/
│   │   │   ├── admin-products/
│   │   │   ├── admin-orders/
│   │   │   └── admin-users/
│   │   ├── shared/
│   │   │   ├── product-card/
│   │   │   └── product-modal/
│   │   ├── home/
│   │   ├── shop/
│   │   ├── cart/
│   │   ├── wishlist/
│   │   ├── profile/
│   │   └── orders/
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   └── order.model.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.css
│   └── app.module.ts
├── assets/
└── styles.css
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd angular-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run watch` - Build and watch for changes

## Key Components

### Services
- **AuthService**: Handles user authentication and session management
- **ProductService**: Manages product data and categories
- **CartService**: Handles shopping cart operations
- **OrderService**: Manages order creation and tracking

### Models
- **User**: User account information
- **Product**: Product details and inventory
- **Order**: Order information and status
- **CartItem**: Shopping cart items

## Features Implementation

### Authentication
- User registration and login
- Role-based access control (user/admin)
- Session management with localStorage
- Protected routes

### Product Management
- Product listing with pagination
- Search functionality
- Category filtering
- Product details modal

### Shopping Cart
- Add/remove items
- Quantity updates
- Price calculations
- Persistent storage per user

### Order System
- Order creation from cart
- Order status tracking
- Admin order management
- Order history

## Data Flow

1. **User Authentication**: Login/Register → AuthService → localStorage
2. **Product Browsing**: ProductService → Product data → UI
3. **Cart Operations**: CartService → Cart data → localStorage
4. **Order Processing**: OrderService → Order data → localStorage

## Security Features

- Input validation
- Role-based route protection
- Secure data handling
- XSS prevention

## Future Enhancements

- Backend API integration
- Real-time notifications
- Payment gateway integration
- Advanced search filters
- Product reviews and ratings
- Email notifications
- Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 