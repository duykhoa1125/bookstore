# 📚 Bookstore - Ứng Dụng Bán Sách Trực Tuyến

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-Latest-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

## 📝 Mô Tả

**Bookstore** là một ứng dụng web thương mại điện tử bán sách trực tuyến được xây dựng với kiến trúc Full-stack hiện đại. Ứng dụng cung cấp trải nghiệm mua sắm sách trực tuyến hoàn chỉnh với giao diện người dùng đẹp mắt, hiệu năng cao và các tính năng quản trị mạnh mẽ.

---

## ✨ Tính Năng Chính

### 👤 Dành cho Người Dùng
- **🔐 Xác thực**: Đăng ký, đăng nhập, đăng nhập bằng Google OAuth 2.0, quên mật khẩu & đặt lại mật khẩu
- **📖 Duyệt sách**: Tìm kiếm, lọc theo danh mục, tác giả, nhà xuất bản, khoảng giá
- **🛒 Giỏ hàng**: Thêm/xóa sách, cập nhật số lượng, chọn item để checkout
- **📦 Đặt hàng**: Thanh toán, theo dõi đơn hàng, xem chi tiết đơn hàng
- **⭐ Đánh giá**: Đánh giá và bình luận sách
- **👤 Hồ sơ**: Quản lý thông tin cá nhân, upload avatar, đổi mật khẩu

### 🛠️ Dành cho Quản Trị Viên
- **📊 Dashboard**: Thống kê doanh thu, đơn hàng, người dùng
- **📚 Quản lý sách**: Thêm, sửa, xóa sách với upload hình ảnh
- **👥 Quản lý người dùng**: Xem, sửa, phân quyền người dùng
- **📁 Quản lý danh mục**: Quản lý thể loại sách (hỗ trợ danh mục con)
- **🏢 Quản lý nhà xuất bản**: CRUD nhà xuất bản
- **✍️ Quản lý tác giả**: CRUD tác giả
- **💳 Quản lý phương thức thanh toán**: Cấu hình các phương thức thanh toán
- **📋 Quản lý đơn hàng**: Xem và cập nhật trạng thái đơn hàng

---

## 🏗️ Kiến Trúc Hệ Thống

```
bookstore/
├── backend/                 # API Server (Express + Prisma)
│   ├── prisma/              # Database schema và migrations
│   │   └── schema.prisma    # Định nghĩa database models
│   └── src/
│       ├── common/          # Shared utilities, constants
│       ├── config/          # Database configuration
│       ├── middlewares/     # Auth, validation middlewares
│       └── modules/         # Feature modules
│           ├── analytics/   # Dashboard statistics
│           ├── auth/        # Authentication logic
│           ├── authors/     # Author management
│           ├── books/       # Book management
│           ├── cart/        # Shopping cart
│           ├── categories/  # Category management
│           ├── orders/      # Order management
│           ├── payment-methods/
│           ├── payments/    # Payment processing
│           ├── publishers/  # Publisher management
│           ├── ratings/     # Book ratings/reviews
│           ├── upload/      # File upload (Cloudinary)
│           └── users/       # User management
│
└── frontend/                # React SPA (Vite + TypeScript)
    └── src/
        ├── components/      # Reusable UI components
        ├── contexts/        # React Contexts (Auth, Cart)
        ├── hooks/           # Custom React hooks
        ├── lib/             # API client, utilities
        ├── pages/           # Page components
        │   └── admin/       # Admin panel pages
        └── types/           # TypeScript definitions
```

---

## 🛠️ Công Nghệ Sử Dụng

### Backend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **Node.js** | 20.x | JavaScript runtime |
| **Express** | 5.x | Web framework |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Prisma** | 6.x | ORM hiện đại |
| **PostgreSQL** | Latest | Cơ sở dữ liệu |
| **JWT** | - | Xác thực token |
| **Cloudinary** | - | Cloud storage cho hình ảnh |
| **Resend** | - | Email service |
| **Zod** | 4.x | Validation schema |
| **bcryptjs** | - | Mã hóa mật khẩu |
| **Google Auth Library** | - | Google OAuth 2.0 |
| **Helmet** | - | Security middleware |

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **React** | 18.2 | UI Library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Vite** | 5.x | Build tool |
| **React Query** | 5.x | Server state management |
| **React Router** | 6.x | Client-side routing |
| **Vanilla CSS** | - | Custom CSS styling |
| **Axios** | - | HTTP client |
| **Lucide React** | - | Icon library |
| **Recharts** | 3.x | Chart library |
| **React Hot Toast** | - | Toast notifications |
| **Google OAuth** | - | Google authentication |

---

## 📊 Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │     │    Book     │     │  Category   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ username    │     │ title       │     │ name        │
│ email       │     │ price       │     │ parentId    │
│ password    │     │ stock       │     └─────────────┘
│ fullName    │     │ description │            │
│ phone       │     │ imageUrl    │            │
│ address     │     │ publisherId │────────────┤
│ googleId    │     │ categoryId  │            ▼
│ avatar      │     └─────────────┘     ┌─────────────┐
│ role        │            │            │  Publisher  │
└─────────────┘            │            ├─────────────┤
      │                    │            │ id          │
      │                    │            │ name        │
      ▼                    ▼            └─────────────┘
┌─────────────┐     ┌─────────────┐
│    Cart     │     │ BookAuthor  │◄────┌─────────────┐
├─────────────┤     ├─────────────┤     │   Author    │
│ id          │     │ bookId      │     ├─────────────┤
│ userId      │     │ authorId    │     │ id          │
│ total       │     └─────────────┘     │ name        │
└─────────────┘                         └─────────────┘
      │
      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  CartItem   │     │   Order     │     │  Payment    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │────▶│ id          │
│ cartId      │     │ userId      │     │ orderId     │
│ bookId      │     │ total       │     │ methodId    │
│ quantity    │     │ status      │     │ status      │
└─────────────┘     │ shippingAddr│     │ total       │
                    └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  OrderItem  │     │   Rating    │
                    ├─────────────┤     ├─────────────┤
                    │ id          │     │ id          │
                    │ orderId     │     │ userId      │
                    │ bookId      │     │ bookId      │
                    │ quantity    │     │ stars       │
                    │ price       │     │ content     │
                    └─────────────┘     └─────────────┘
```

---

## 🚀 Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- **Node.js** >= 20.x
- **npm** >= 10.x
- **PostgreSQL** database (local hoặc cloud như Supabase, Neon)

### 1. Clone Repository

```bash
git clone <repository-url>
cd bookstore
```

### 2. Thiết Lập Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env
```

**Cấu hình file `.env`:**

```env
# Database - PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
DIRECT_URL="postgresql://username:password@host:port/database?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS - Frontend URLs (comma-separated)
CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3001"
FRONTEND_URL="http://localhost:5173"

# Cloudinary (optional - for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"

# Resend Email Service (optional - for password reset emails)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="Bookstore <onboarding@resend.dev>"
```

```bash
# Chạy Prisma migrations
npm run prisma:migrate

# (Tùy chọn) Seed database với dữ liệu mẫu
npm run prisma:seed

# Chạy development server
npm run dev
```

Backend sẽ chạy tại: `http://localhost:3000`

### 3. Thiết Lập Frontend

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env
echo "VITE_API_URL=http://localhost:3000/api" > .env
echo "VITE_GOOGLE_CLIENT_ID=your-google-client-id" >> .env

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 📖 API Documentation

Chi tiết về các endpoints API có thể xem tại file: [`backend/API_ENDPOINTS.md`](./backend/API_ENDPOINTS.md)

### Tổng Quan API

| Module | Base Path | Mô tả |
|--------|-----------|-------|
| Auth | `/api/auth` | Đăng ký, đăng nhập, Google OAuth |
| Users | `/api/users` | Quản lý người dùng |
| Books | `/api/books` | CRUD sách |
| Categories | `/api/categories` | Quản lý danh mục |
| Authors | `/api/authors` | Quản lý tác giả |
| Publishers | `/api/publishers` | Quản lý nhà xuất bản |
| Cart | `/api/cart` | Giỏ hàng |
| Orders | `/api/orders` | Đặt hàng |
| Payments | `/api/payments` | Thanh toán |
| Ratings | `/api/ratings` | Đánh giá sách |
| Analytics | `/api/analytics` | Thống kê (Admin) |
| Upload | `/api/upload` | Upload hình ảnh |

---

## 🔐 Phân Quyền

| Role | Mô tả |
|------|-------|
| **USER** | Người dùng thông thường - có thể duyệt sách, đặt hàng, đánh giá |
| **ADMIN** | Quản trị viên - toàn quyền quản lý hệ thống |

---

## 📱 Tính Năng Giao Diện

### 🎨 Thiết Kế Hiện Đại & Responsive
- **Neo-Minimalist UI**: Giao diện tối giản, hiện đại với màu sắc tinh tế
- **Responsive Design**: Tối ưu cho mọi kích thước màn hình (desktop, tablet, mobile)
- **Dark Mode Support**: Hỗ trợ chế độ tối/sáng
- **Smooth Animations**: Hiệu ứng chuyển động mượt mà với micro-interactions
- **Loading Skeletons**: Skeleton screens chi tiết cho tất cả các trang

### ✨ Trải Nghiệm Người Dùng
- **Trang Chủ**: Hero section với parallax effects, featured books carousel
- **Danh Sách Sách**: 
  - Book cards với 3D tilt effects
  - Badges "New" và "Low Stock"
  - Quick view modal và add to cart nhanh
  - Filter sidebar hiện đại với accordion sections
- **Chi Tiết Sách**: 
  - Gallery ảnh, thông tin chi tiết
  - Hệ thống đánh giá và review với rating filters
  - Related books suggestions
- **Giỏ Hàng & Thanh Toán**: 
  - Chọn items cụ thể để checkout
  - Confirmation modal trước khi đặt hàng
  - Order summary rõ ràng với breakdown chi phí
- **Admin Dashboard**: 
  - Charts và biểu đồ thống kê với Recharts
  - Custom modals cho create/edit/delete
  - Data tables với sorting và filtering
  - Toast notifications cho mọi hành động

---

## 🧪 Scripts

### Backend

```bash
npm run dev              # Chạy development server với nodemon
npm run build            # Build production
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
```

### Frontend

```bash
npm run dev      # Chạy development server
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Chạy ESLint
```

---

## 🌐 Deployment

### Backend (Render, Railway, Heroku...)

1. Tạo PostgreSQL database (Supabase, Neon, Railway...)
2. Set các environment variables
3. Build command: `npm run build`
4. Start command: `npm run start`

### Frontend (Vercel, Netlify, Cloudflare Pages...)

1. Set `VITE_API_URL` environment variable
2. Build command: `npm run build`
3. Output directory: `dist`

---

## 👥 Đóng Góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo Pull Request hoặc Issue nếu bạn muốn đóng góp cho dự án.

---

## 📄 License

Dự án này được phát hành dưới giấy phép ISC.

---

<p align="center">
  Made with ❤️ by <strong>Your Name</strong>
</p>
