# 📚 BookStore – Hệ thống Quản lý Nhà sách Trực tuyến

> **Đồ án Tổng hợp Công nghệ Phần mềm (CO3103)** – Học kỳ 251  
> Giảng viên hướng dẫn: **ThS. Trần Trương Tuấn Phát**

## Giới thiệu

BookStore là một ứng dụng web full-stack cho phép người dùng duyệt, tìm kiếm, mua sách trực tuyến và quản lý đơn hàng. Hệ thống phân quyền rõ ràng giữa **Khách hàng** (User) và **Quản trị viên** (Admin), đáp ứng đầy đủ quy trình mua – bán sách từ giỏ hàng đến thanh toán.

## Công nghệ sử dụng

| Tầng | Công nghệ |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, React Router v6, TanStack React Query |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Xác thực** | JWT, Google OAuth 2.0 |
| **Upload ảnh** | Cloudinary, Multer |
| **Email** | Resend |
| **Bảo mật** | Helmet, bcryptjs, Zod validation |

## Tính năng

### 🔐 Xác thực & Phân quyền
- Đăng ký / Đăng nhập bằng tài khoản hệ thống hoặc **Google OAuth 2.0**
- Quên mật khẩu – gửi link đặt lại qua email (Resend)
- Phân quyền hai vai trò: **User** và **Admin** (admin@bookstore.com / password123)
- Bảo vệ route phía frontend (ProtectedRoute, AdminRoute) và xác thực JWT phía backend

### 🛒 Mua sắm & Thanh toán
- Duyệt catalogue sách với bộ lọc theo **danh mục, tác giả, nhà xuất bản**
- Xem chi tiết sách: mô tả, giá, tồn kho, đánh giá, sách liên quan
- Giỏ hàng: chọn sản phẩm, chỉnh số lượng, xoá mục, tự động tính tổng tiền
- Đặt hàng với địa chỉ giao hàng và chọn phương thức thanh toán (do Admin cấu hình)
- Modal xác nhận đơn hàng trước khi đặt
- Theo dõi đơn hàng qua các trạng thái: `PENDING → PROCESSING → SHIPPED → DELIVERED`

### ⭐ Đánh giá & Tương tác
- Đánh giá sách (1–5 sao) kèm nội dung nhận xét
- Bình chọn (upvote / downvote) đánh giá của người dùng khác
- Xem lại tất cả đánh giá cá nhân đã viết

### 👤 Hồ sơ cá nhân
- Cập nhật thông tin cá nhân (họ tên, SĐT, địa chỉ)
- Upload ảnh đại diện qua **Cloudinary**

### 📊 Quản trị (Admin)
- **Dashboard** thống kê doanh thu, đơn hàng, sản phẩm bán chạy (biểu đồ Recharts)
- CRUD đầy đủ: sách, danh mục, tác giả, nhà xuất bản, phương thức thanh toán
- Quản lý đơn hàng: xác nhận, cập nhật trạng thái, ghi nhận admin xử lý
- Quản lý tài khoản người dùng & kiểm duyệt đánh giá

## Cấu trúc dự án

```
bookstore/
├── backend/                # Server-side
│   ├── prisma/             # Schema, migrations, seed data
│   └── src/
│       ├── config/         # Cấu hình môi trường
│       ├── middleware/     # Auth, error, validation
│       ├── modules/       # Các module nghiệp vụ
│       │   ├── auth/       ├── books/
│       │   ├── cart/       ├── orders/
│       │   ├── ratings/    ├── payments/
│       │   ├── categories/ ├── publishers/
│       │   ├── authors/    ├── users/
│       │   ├── analytics/  └── upload/
│       ├── types/          # Định nghĩa kiểu TypeScript
│       └── utils/          # Hàm tiện ích
│
├── frontend/               # Client-side
│   └── src/
│       ├── components/     # UI components tái sử dụng
│       ├── contexts/       # Auth & Backend health context
│       ├── lib/            # API client, helpers
│       ├── pages/          # Các trang (Home, Books, Cart, ...)
│       │   └── admin/      # Trang quản trị
│       ├── styles/         # CSS
│       └── types/          # Định nghĩa kiểu dữ liệu
│
└── docs/                   # Tài liệu đồ án
    ├── diagrams/           # Sơ đồ UML
    ├── references/         # Tài liệu tham khảo
    ├── reports/            # Báo cáo
    └── requirements/       # Đặc tả yêu cầu
```

## Cài đặt & Chạy

### Yêu cầu
- Node.js ≥ 20.x
- PostgreSQL
- npm ≥ 10.x

### Backend

```bash
cd backend
npm install
# Tạo file .env với DATABASE_URL, JWT_SECRET, ...
npx prisma migrate dev      # Áp dụng migration
npm run prisma:seed          # Seed dữ liệu mẫu
npm run dev                  # Chạy server dev (nodemon)
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # Chạy Vite dev server
```

## API

Backend cung cấp RESTful API với các nhóm endpoint chính:

| Nhóm | Endpoint | Mô tả |
|---|---|---|
| Auth | `/api/auth` | Đăng ký, đăng nhập, Google OAuth, reset password |
| Books | `/api/books` | CRUD sách, tìm kiếm, lọc |
| Categories | `/api/categories` | Quản lý danh mục sách |
| Cart | `/api/cart` | Giỏ hàng người dùng |
| Orders | `/api/orders` | Đặt hàng, theo dõi đơn |
| Ratings | `/api/ratings` | Đánh giá & vote |
| Payments | `/api/payments` | Xử lý thanh toán Stripe/PayPal |
| Analytics | `/api/analytics` | Thống kê doanh thu (Admin) |
| Users | `/api/users` | Quản lý người dùng |
| Upload | `/api/upload` | Upload ảnh sách, avatar |

## Mô hình cơ sở dữ liệu

Hệ thống sử dụng **12 bảng** chính: `User`, `Book`, `Author`, `BookAuthor`, `Category`, `Publisher`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `PaymentMethod`, `Rating`, `RatingVote`, `PasswordResetToken` – được quản lý qua **Prisma ORM** với PostgreSQL.

*Đồ án Tổng hợp Công nghệ Phần mềm – CO3103 – ĐHBK TP.HCM*
