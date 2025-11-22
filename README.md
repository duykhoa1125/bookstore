# 📚 Bookstore - Fullstack E-commerce Application

Một ứng dụng web bán sách đầy đủ tính năng với frontend React và backend Node.js.

## 🚀 Tech Stack

### Frontend
- **React 18** với **TypeScript**
- **Vite** - Build tool nhanh
- **React Router** - Routing
- **TanStack Query** - Data fetching & caching
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Tailwind CSS** - Styling

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image uploads
- **Zod** - Validation
- **Helmet** - Security
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
bookstore/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities & API clients
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static files
│   └── package.json
│
├── backend/           # Node.js backend API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── middlewares/   # Express middlewares
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utilities
│   │   ├── validators/    # Zod schemas
│   │   └── server.ts      # Express app
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data
│   └── package.json
│
└── .agent/
    └── workflows/
        └── deploy.md      # Deployment guide
```

## ✨ Features

### User Features
- 🔐 **Authentication**: Đăng ký, đăng nhập, JWT-based auth
- 📖 **Book Browsing**: Xem danh sách sách, tìm kiếm, lọc theo category
- 📘 **Book Details**: Xem chi tiết sách, tác giả, nhà xuất bản, đánh giá
- 🛒 **Shopping Cart**: Thêm vào giỏ hàng, cập nhật số lượng, xóa items
- 📦 **Order Management**: Tạo đơn hàng, xem lịch sử đơn hàng
- ⭐ **Ratings & Reviews**: Đánh giá sách, xem đánh giá của người khác
- 👤 **Profile Management**: Cập nhật thông tin cá nhân

### Admin Features
- 📚 **Book Management**: CRUD operations cho sách
- 👥 **Category Management**: Quản lý danh mục sách
- 🏢 **Publisher Management**: Quản lý nhà xuất bản
- ✍️ **Author Management**: Quản lý tác giả
- 📦 **Order Management**: Xem và cập nhật trạng thái đơn hàng
- 💳 **Payment Methods**: Quản lý phương thức thanh toán

## 🛠️ Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd bookstore
```

2. **Setup Backend**
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials and secrets

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

3. **Setup Frontend**
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env với backend URL (mặc định: http://localhost:3000/api)

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/bookstore"
JWT_SECRET="your-secret-key-here"
PORT=3000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🚢 Deployment

Xem hướng dẫn deploy chi tiết tại: [.agent/workflows/deploy.md](.agent/workflows/deploy.md)

### Quick Deploy Guide

**Khuyến nghị cho học tập/demo:**
- **Database**: Neon hoặc Supabase (PostgreSQL miễn phí)
- **Backend**: Railway hoặc Render
- **Frontend**: Vercel hoặc Netlify
- **Images**: Cloudinary

Chi tiết các bước deploy được mô tả trong file `deploy.md`.

## 📚 API Documentation

API endpoints được tổ chức theo các modules:

- `/api/auth` - Authentication (login, register)
- `/api/books` - Book management
- `/api/categories` - Category management
- `/api/authors` - Author management
- `/api/publishers` - Publisher management
- `/api/cart` - Shopping cart
- `/api/orders` - Order management
- `/api/ratings` - Book ratings
- `/api/payment-methods` - Payment methods
- `/api/payments` - Payment processing

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing với bcrypt
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ Input validation với Zod
- ✅ SQL injection protection (Prisma ORM)

## 🧪 Testing

```bash
# Backend tests (nếu có)
cd backend
npm test

# Frontend tests (nếu có)
cd frontend
npm test
```

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Prisma for the amazing ORM
- Vercel team for Vite and deployment platform
- All open-source contributors

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Happy Coding! 🚀**
