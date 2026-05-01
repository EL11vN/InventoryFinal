# Backend API - Inventory Management System

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase Emulator Suite (for localhost testing)
- npm or yarn

### Setup (Localhost with Firebase Emulator)

1. **Install Dependencies**
```bash
npm install
```

2. **Create Environment File**
```bash
cp .env.example .env
```

3. **Install Firebase CLI** (if not already installed)
```bash
npm install -g firebase-tools
firebase login
```

4. **Start Firebase Emulator** (in separate terminal)
```bash
# Navigate to project root (parent directory)
cd ..
firebase emulators:start
```

5. **Start Development Server**
```bash
npm run dev
```

Server will run on: **http://localhost:3000**  
API Docs: **http://localhost:3000/api-docs**

---

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── firebase.ts              # Firebase Admin SDK setup
│   ├── controllers/
│   │   ├── authController.ts        # Auth logic (register, login)
│   │   ├── productController.ts     # Product CRUD
│   │   └── categoryController.ts    # Category CRUD
│   ├── middleware/
│   │   └── auth.ts                  # JWT verification, role checking
│   ├── routes/
│   │   ├── authRoutes.ts            # Auth endpoints
│   │   ├── productRoutes.ts         # Product endpoints
│   │   └── categoryRoutes.ts        # Category endpoints
│   ├── utils/
│   │   └── swagger.ts               # OpenAPI/Swagger definition
│   └── index.ts                     # Main Express app
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (requires auth)
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### File Upload
- `POST /api/upload` - Upload single file (image/document)
- `POST /api/upload/multiple` - Upload multiple files (max 10)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Demo Credentials (When using emulator with seed data)
- **Admin:** `admin@demo.com` / `admin123`
- **User:** `user@demo.com` / `user123`

---

## 📊 Firebase Firestore Collections

### users
```typescript
{
  uid: string
  email: string
  displayName: string
  role: 'admin' | 'user'
  createdAt: timestamp
  updatedAt: timestamp
  isActive: boolean
}
```

### products
```typescript
{
  id: string
  name: string
  description: string
  categoryId: string
  categoryName: string
  sku: string (unique)
  price: number
  quantity: number
  minStockLevel: number
  images: string[]
  supplier: string
  status: 'active' | 'inactive' | 'discontinued'
  tags: string[]
  createdBy: string (user uid)
  createdAt: timestamp
  updatedAt: timestamp
  lastUpdatedBy: string
}
```

### categories
```typescript
{
  id: string
  name: string
  description: string
  image: string (URL)
  createdBy: string (user uid)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### auditLogs
```typescript
{
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  changes: object
  timestamp: timestamp
}
```

---

## 🧪 Testing Endpoints

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "displayName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

### Get All Products
```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Laptop Pro",
    "sku": "LP-001",
    "categoryId": "cat-001",
    "price": 1299.99,
    "quantity": 5,
    "minStockLevel": 10,
    "supplier": "Tech Suppliers Inc"
  }'
```

---

## 🔧 Build & Deployment

### Build for Production
```bash
npm run build
```

Compiled files will be in the `dist/` directory.

### Start Production Server
```bash
npm start
```

---

## 📝 Environment Variables

Create a `.env` file in the server directory:

```bash
# Firebase
FIREBASE_PROJECT_ID=your-project-id
USE_FIRESTORE_EMULATOR=true
FIRESTORE_EMULATOR_HOST=localhost:8080

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
```

---

## 🚨 Error Handling

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔗 Swagger/OpenAPI Documentation

Access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

---

## 🛠️ Development Tools

- **TypeScript** - Type-safe code
- **Express** - Web framework
- **Firebase Admin SDK** - Firestore, Auth, Storage
- **CORS** - Cross-origin requests
- **Swagger UI** - API documentation
- **ts-node** - Run TypeScript directly

---

## 📦 Dependencies

### Production
- `express` - Web framework
- `firebase-admin` - Firebase backend
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `swagger-ui-express` - Swagger UI
- `swagger-jsdoc` - Swagger documentation

### Development
- `typescript` - Type system
- `ts-node` - Execute TypeScript
- `@types/*` - Type definitions
- `jest` - Testing framework

---

## 🐛 Troubleshooting

### Firebase Emulator Issues
- Make sure emulator is running: `firebase emulators:start`
- Check `FIRESTORE_EMULATOR_HOST` is set correctly
- Clear emulator data if needed: `firebase emulators:start --clear-on-exit`

### Port Already in Use
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

---

## 📞 Support

For Firebase documentation: https://firebase.google.com/docs  
For Express.js: https://expressjs.com/  
For TypeScript: https://www.typescriptlang.org/
