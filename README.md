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

#### 🔐 Xác thực & Bảo mật
- **Đăng ký / Đăng nhập**: Form validation với Zod schema
- **Google OAuth 2.0**: Đăng nhập nhanh bằng tài khoản Google
- **Quên mật khẩu**: Gửi email reset password qua Resend
- **Đặt lại mật khẩu**: Token-based password reset với expiration time
- **Đổi mật khẩu**: Yêu cầu xác thực current password
- **JWT Authentication**: Stateless token-based auth với configurable expiry

#### 📖 Duyệt Sách & Tìm Kiếm
- **Tìm kiếm**: Full-text search theo tên sách
- **Lọc theo danh mục**: Hỗ trợ danh mục lồng nhau (parent/child categories)
- **Lọc theo tác giả**: Dropdown select với tất cả tác giả
- **Lọc theo nhà xuất bản**: Filter by publisher
- **Lọc theo khoảng giá**: Min/Max price range filter
- **Sắp xếp**: Sort by price (asc/desc), rating (asc/desc)
- **Phân trang**: Client-side pagination với customizable items per page

#### 🛒 Giỏ Hàng & Thanh Toán
- **Thêm/Xóa sách**: Real-time cart updates với optimistic UI
- **Cập nhật số lượng**: Increment/decrement với stock validation
- **Selective Checkout**: Chọn từng item để thanh toán
- **Stock Validation**: Kiểm tra tồn kho trước khi checkout
- **Payment Confirmation Modal**: Xác nhận thanh toán với breakdown chi phí

#### 📦 Quản Lý Đơn Hàng
- **Đặt hàng**: Tạo order với shipping address và payment method
- **Order Timeline**: Visual progress tracker (Placed → Processing → Shipped → Delivered)
- **Order History**: Xem lịch sử tất cả đơn hàng với status filtering
- **Order Detail**: Chi tiết đơn hàng với payment info, items list
- **Payment Instructions**: Hướng dẫn thanh toán theo từng phương thức (COD, Bank Transfer, Online)

#### 📧 Email Notifications
- **Order Confirmation Email**: Email tự động sau khi đặt hàng thành công
- **Password Reset Email**: Email link reset password với token

#### ⭐ Đánh Giá & Review
- **Write Review**: Đánh giá sách (1-5 sao) với optional content
- **Purchase Verification**: Chỉ cho phép review sau khi đã mua sách
- **Upvote/Downvote**: Vote review của người khác
- **My Ratings**: Trang quản lý các review đã viết
- **Average Rating**: Hiển thị rating trung bình trên book card
- **Rating Filters**: Filter reviews by star rating

#### 👤 Hồ Sơ Cá Nhân
- **View/Edit Profile**: Cập nhật fullName, phone, address
- **Upload Avatar**: Cloudinary image upload với preview
- **Change Password**: Đổi mật khẩu với current password verification

---

### 🛠️ Dành cho Quản Trị Viên

#### 📊 Dashboard Analytics
Dashboard hiện đại với các biểu đồ thống kê real-time:
- **Time Range Filtering**: 6 Months, 30 Days, 7 Days, Yesterday
- **Stat Cards**: Total Revenue, Customers, Orders, Stock Alerts
- **Revenue Trend**: Line chart với revenue theo thời gian
- **Orders by Status**: Pie chart phân bổ trạng thái đơn hàng
- **Sales by Category**: Horizontal bar chart doanh thu theo danh mục
- **Top Customers**: Ranking khách hàng chi tiêu nhiều nhất
- **Recent Orders**: Bảng đơn hàng gần đây với quick links
- **Top Selling Books**: Ranking sách bán chạy nhất

#### 📚 Quản Lý Sách
- **CRUD Operations**: Thêm, sửa, xóa sách
- **Image Upload**: Upload ảnh bìa sách qua Cloudinary
- **Multi-Author Support**: Assign nhiều tác giả cho một sách
- **Stock Management**: Quản lý số lượng tồn kho
- **Category Assignment**: Gán sách vào danh mục

#### 👥 Quản Lý Người Dùng
- **User List**: Danh sách tất cả users với pagination
- **Search Users**: Tìm kiếm theo name, email
- **Edit User**: Cập nhật thông tin user
- **Role Management**: Phân quyền USER/ADMIN
- **Position Field**: Thêm chức vụ cho admin users

#### 📁 Quản Lý Danh Mục
- **Nested Categories**: Hỗ trợ danh mục cha/con
- **CRUD Operations**: Thêm, sửa, xóa categories
- **Books Count**: Hiển thị số sách trong mỗi danh mục

#### 🏢 Quản Lý Nhà Xuất Bản
- **CRUD Operations**: Thêm, sửa, xóa publishers
- **Books Count**: Số lượng sách theo publisher

#### ✍️ Quản Lý Tác Giả
- **CRUD Operations**: Thêm, sửa, xóa authors
- **Books Count**: Số lượng sách của tác giả

#### 💳 Quản Lý Phương Thức Thanh Toán
- **CRUD Operations**: Thêm, sửa, xóa payment methods
- **Method Types**: COD, Bank Transfer, Online Payment, etc.

#### 📋 Quản Lý Đơn Hàng
- **Order List**: Tất cả đơn hàng với status badges
- **Status Filter**: Filter by PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- **Update Status**: Admin xác nhận và cập nhật trạng thái
- **Order Details**: Xem chi tiết đơn hàng, customer info, items

#### 🛡️ Quản Lý Reviews
- **Review List**: Danh sách tất cả reviews với pagination
- **Search Reviews**: Tìm kiếm theo content, user, book
- **Stars Filter**: Filter by rating (1-5 stars)
- **Status Filter**:
  - **Suspicious**: Reviews có downvotes > upvotes và >= 2 downvotes
  - **Sensitive**: Reviews chứa từ khóa nhạy cảm
- **Vote Display**: Hiển thị upvotes/downvotes count
- **Custom Keywords**: Thêm từ khóa nhạy cảm tùy chỉnh (saved to localStorage)
- **Delete Review**: Xóa review vi phạm
- **View Detail Modal**: Xem chi tiết review với status badge

---

## 🏗️ Kiến Trúc Hệ Thống

```
bookstore/
├── backend/                 # API Server (Express + Prisma)
│   ├── prisma/              # Database schema và migrations
│   │   └── schema.prisma    # Định nghĩa database models
│   └── src/
│       ├── common/          # Shared utilities, constants
│       ├── config/          # Database, environment configuration
│       ├── middlewares/     # Auth, validation, error middlewares
│       ├── utils/           # JWT, Password, Email utilities
│       └── modules/         # Feature modules (13 modules)
│           ├── analytics/   # Dashboard statistics & charts
│           ├── auth/        # Authentication, OAuth, Password reset
│           ├── authors/     # Author management
│           ├── books/       # Book CRUD, search, filtering
│           ├── cart/        # Shopping cart operations
│           ├── categories/  # Nested category management
│           ├── orders/      # Order processing, status updates
│           ├── payment-methods/  # Payment method CRUD
│           ├── payments/    # Payment processing
│           ├── publishers/  # Publisher management
│           ├── ratings/     # Reviews, votes, moderation
│           ├── upload/      # Cloudinary file upload
│           └── users/       # User management, profile
│
└── frontend/                # React SPA (Vite + TypeScript)
    └── src/
        ├── components/      # Reusable UI components (27+ components)
        ├── contexts/        # React Contexts (Auth, BackendHealth)
        ├── hooks/           # Custom React hooks
        ├── lib/             # API client, utilities
        ├── pages/           # Page components (15 user + 11 admin)
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
| **Prisma** | 6.x | Modern ORM với type-safe queries |
| **PostgreSQL** | Latest | Cơ sở dữ liệu quan hệ |
| **JWT** | - | Stateless authentication |
| **Cloudinary** | - | Cloud image storage & CDN |
| **Resend** | - | Email service API |
| **Zod** | 4.x | Schema validation |
| **bcryptjs** | - | Password hashing |
| **Google Auth Library** | - | Google OAuth 2.0 |
| **Helmet** | - | Security HTTP headers |
| **CORS** | - | Cross-Origin Resource Sharing |

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **React** | 18.2 | UI Library với Hooks |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Vite** | 5.x | Lightning fast build tool |
| **React Query** | 5.x | Server state management & caching |
| **React Router** | 6.x | Client-side routing |
| **Vanilla CSS** | - | Custom CSS với CSS Variables |
| **Axios** | - | HTTP client với interceptors |
| **Lucide React** | - | Beautiful SVG icon library |
| **Recharts** | 3.x | Composable charting library |
| **React Hot Toast** | - | Toast notifications |
| **@react-oauth/google** | - | Google OAuth integration |

---

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │     │      Book       │     │    Category     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ username        │     │ title           │     │ name            │
│ email           │     │ price           │     │ parentCategoryId│──┐
│ password?       │     │ stock           │     └─────────────────┘  │
│ fullName        │     │ description     │            ▲             │
│ phone?          │     │ imageUrl        │            └─────────────┘
│ address?        │     │ publisherId     │────────┐
│ position?       │     │ categoryId      │────────┼─▶┌─────────────┐
│ googleId?       │     └─────────────────┘        │  │  Publisher  │
│ avatar?         │            │                   │  ├─────────────┤
│ role (ADMIN/USER)            │                   └──│ id          │
└─────────────────┘            │                      │ name        │
       │                       ▼                      └─────────────┘
       │               ┌─────────────────┐
       │               │   BookAuthor    │◄────┌─────────────┐
       │               ├─────────────────┤     │   Author    │
       │               │ bookId          │     ├─────────────┤
       │               │ authorId        │     │ id          │
       │               └─────────────────┘     │ name        │
       │                                       └─────────────┘
       │
       ├──────────────────────┬─────────────────────┐
       ▼                      ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌───────────────────┐
│      Cart       │   │     Order       │   │PasswordResetToken │
├─────────────────┤   ├─────────────────┤   ├───────────────────┤
│ id              │   │ id              │   │ id                │
│ userId (unique) │   │ userId          │   │ token             │
│ total           │   │ confirmedById?  │   │ userId            │
└─────────────────┘   │ total           │   │ expiresAt         │
       │              │ status          │   │ used              │
       ▼              │ shippingAddress │   └───────────────────┘
┌─────────────────┐   │ orderDate       │
│    CartItem     │   └─────────────────┘
├─────────────────┤          │
│ id              │          ├────────────────────┐
│ cartId          │          │                    │
│ bookId          │          ▼                    ▼
│ quantity        │   ┌─────────────────┐  ┌─────────────────┐
└─────────────────┘   │   OrderItem     │  │    Payment      │
                      ├─────────────────┤  ├─────────────────┤
                      │ id              │  │ id              │
                      │ orderId         │  │ orderId (unique)│
                      │ bookId          │  │ paymentMethodId │
                      │ quantity        │  │ status          │
                      │ price           │  │ total           │
                      └─────────────────┘  │ paymentDate?    │
                                           └─────────────────┘
                                                  │
                                                  ▼
┌─────────────────┐   ┌─────────────────┐  ┌─────────────────┐
│     Rating      │   │   RatingVote    │  │ PaymentMethod   │
├─────────────────┤   ├─────────────────┤  ├─────────────────┤
│ id              │──▶│ id              │  │ id              │
│ userId          │   │ ratingId        │  │ name            │
│ bookId          │   │ userId          │  └─────────────────┘
│ stars (1-5)     │   │ voteType (±1)   │
│ content?        │   └─────────────────┘
└─────────────────┘
```

### Enum Types

| Enum | Values |
|------|--------|
| **Role** | `ADMIN`, `USER` |
| **OrderStatus** | `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| **PaymentStatus** | `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` |

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

# Cloudinary (required for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"

# Resend Email Service (required for password reset & order emails)
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

### Tổng Quan API Endpoints

| Module | Base Path | Endpoints | Mô tả |
|--------|-----------|-----------|-------|
| **Auth** | `/api/auth` | 8 endpoints | Register, Login, Google OAuth, Profile, Password |
| **Users** | `/api/users` | 4 endpoints | CRUD, Avatar upload |
| **Books** | `/api/books` | 6 endpoints | CRUD, Search, Filter, Related books |
| **Categories** | `/api/categories` | 4 endpoints | CRUD với nested support |
| **Authors** | `/api/authors` | 4 endpoints | CRUD |
| **Publishers** | `/api/publishers` | 4 endpoints | CRUD |
| **Cart** | `/api/cart` | 5 endpoints | Get, Add, Update, Remove, Clear |
| **Orders** | `/api/orders` | 5 endpoints | Create, List, Detail, Confirm (Admin) |
| **Payments** | `/api/payments` | 3 endpoints | Process payment |
| **Payment Methods** | `/api/payment-methods` | 4 endpoints | CRUD |
| **Ratings** | `/api/ratings` | 10 endpoints | CRUD, Votes, Admin moderation |
| **Analytics** | `/api/analytics` | 8 endpoints | Dashboard stats, Charts data |
| **Upload** | `/api/upload` | 2 endpoints | Image upload to Cloudinary |
| **Health** | `/health` | 1 endpoint | Backend health check |

---

## 🔐 Phân Quyền

| Role | Mô tả | Quyền hạn |
|------|-------|-----------|
| **USER** | Người dùng thông thường | Duyệt sách, đặt hàng, đánh giá, quản lý profile |
| **ADMIN** | Quản trị viên | Toàn quyền + Dashboard, CRUD entities, Moderation |

### Protected Routes

- `/api/auth/profile`: Authenticated users
- `/api/cart/*`: Authenticated users
- `/api/orders/*`: Authenticated users
- `/api/ratings/*`: Authenticated users (except GET)
- `/api/admin/*`: ADMIN role only
- `/api/analytics/*`: ADMIN role only

---

## 📱 Tính Năng Giao Diện

### 🎨 Thiết Kế Hiện Đại & Responsive
- **Neo-Minimalist UI**: Giao diện tối giản, hiện đại với màu sắc tinh tế
- **Glassmorphism Effects**: Backdrop blur, semi-transparent cards
- **Responsive Design**: Optimized cho Desktop, Tablet, Mobile
- **Dark-friendly Colors**: Neutral palette dễ nhìn
- **Smooth Animations**: CSS transitions, micro-interactions
- **Loading States**: Skeleton loaders cho tất cả data fetching

### ✨ Trải Nghiệm Người Dùng

#### Trang Chủ (Home)
- **Hero Section**: Featured content với call-to-action
- **Categories Carousel**: Horizontal scroll categories
- **Featured Books Grid**: Sách nổi bật với quick add to cart
- **Author Spotlight**: Component highlight tác giả
- **Stats Milestones**: Achievement badges (books, categories, etc.)
- **Customer Reviews**: Testimonials section

#### Trang Danh Sách Sách (Books)
- **Book Cards**: Cover image, title, author, price, rating
- **"New" Badge**: Sách mới trong 30 ngày
- **"Low Stock" Badge**: Sách còn ít hàng (< 5)
- **Quick View Modal**: Xem nhanh chi tiết sách
- **Add to Cart Button**: Nút thêm vào giỏ với loading state
- **Filter Sidebar**: Accordion sections cho filters
- **Sort Options**: Price (asc/desc), Rating (asc/desc)
- **Pagination**: Page numbers với items per page selector

#### Chi Tiết Sách (Book Detail)
- **Book Image Gallery**: Ảnh bìa lớn
- **Info Section**: Title, authors, publisher, category, price
- **Stock Status**: In stock / Low stock / Out of stock
- **Add to Cart**: Quantity selector + Add button
- **Description Tab**: Mô tả chi tiết sách
- **Reviews Section**: 
  - Rating summary (average, distribution)
  - Review list với votes
  - Write review form (if purchased)
  - Star filter buttons
- **Related Books**: Carousel sách liên quan

#### Giỏ Hàng (Cart)
- **Cart Items List**: Checkbox select, image, title, price, quantity
- **Quantity Controls**: +/- buttons với max validation
- **Select All**: Checkbox select all items
- **Remove Item**: Xóa từng item
- **Order Summary**: Subtotal, items count, total
- **Checkout Button**: Chuyển sang Payment modal
- **Payment Confirmation Modal**: 
  - Shipping address input
  - Payment method selection
  - Payment instructions preview
  - Confirm order button

#### Thanh Toán Thành Công (Payment Success)
- **Confetti Animation**: Celebration effect
- **Order Summary**: Order ID, total, items count
- **Payment Instructions**: Chi tiết thanh toán theo method
- **Action Buttons**: View order / Continue shopping

#### Chi Tiết Đơn Hàng (Order Detail)
- **Order Timeline**: Visual progress tracker
- **Order Info**: ID, date, status badge
- **Items Table**: Books ordered with quantity & price
- **Payment Section**: Method, status, instructions
- **Shipping Address**: Customer delivery address

#### Admin Dashboard
- **Glass-morphism Cards**: Stat cards với icons
- **Time Range Selector**: Dropdown filter 6M/30D/7D/Yesterday
- **Line Chart**: Revenue trend over time
- **Pie Chart**: Orders distribution by status
- **Bar Chart**: Sales by category (horizontal)
- **Top Customers List**: Ranked by spending
- **Recent Orders Table**: Latest orders with status
- **Top Selling Books**: Ranked by quantity sold

#### Admin Reviews Page
- **Data Table**: User, Book, Stars, Content, Votes, Status
- **Status Badges**: OK (green), Suspicious (orange), Sensitive (red)
- **Row Highlighting**: Colored rows for flagged reviews
- **Filter Bar**: Search, Stars filter, Status filter, Sort
- **Badge Counts**: Number of suspicious/sensitive reviews
- **Settings Modal**: Manage custom sensitive keywords
- **View Detail Modal**: Full review with metadata
- **Delete Confirmation**: Modal confirm khi xóa

### 🔧 Components Library

| Component | Mô tả |
|-----------|-------|
| `Header` | Navigation với auth state, cart count, mobile menu |
| `Footer` | Links, social, copyright |
| `BookCard` | Card hiển thị thông tin sách |
| `QuickViewModal` | Modal xem nhanh sách |
| `Pagination` | Page navigation với items per page |
| `ConfirmModal` | Modal xác nhận actions |
| `Modal` | Base modal component |
| `OrderTimeline` | Visual order status tracker |
| `PaymentConfirmationModal` | Checkout flow modal |
| `RatingVoteButtons` | Upvote/Downvote buttons |
| `RelatedBooks` | Carousel sách liên quan |
| `AvatarUpload` | Profile avatar upload |
| `BookImageUpload` | Admin book image upload |
| `Breadcrumb` | Navigation breadcrumb |
| `SkeletonLoaders` | Loading placeholder components |
| `ServerWakingScreen` | Backend health check overlay |
| `ErrorBoundary` | React error boundary |
| `ScrollToTop` | Auto scroll on navigation |

---

## 🧪 Scripts

### Backend

```bash
npm run dev              # Chạy development server với nodemon
npm run build            # Build production
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed database với sample data
```

### Frontend

```bash
npm run dev      # Chạy development server (Vite)
npm run build    # Build production
npm run preview  # Preview production build locally
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

1. Set environment variables:
   - `VITE_API_URL`: Backend API URL
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID
2. Build command: `npm run build`
3. Output directory: `dist`

### Environment Variables cho Production

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct PostgreSQL URL (for Prisma)
- `JWT_SECRET` - Strong secret key
- `CORS_ALLOWED_ORIGINS` - Production frontend URLs
- `CLOUDINARY_*` - Cloudinary credentials
- `GOOGLE_CLIENT_ID` - Google OAuth
- `RESEND_API_KEY` - Email service

**Frontend:**
- `VITE_API_URL` - Production API URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID

---

## 📂 Tài Liệu Dự Án

Các file tài liệu trong thư mục `/docs`:

| File | Mô tả |
|------|-------|
| `PROJECT_KNOWLEDGE.md` | Kiến thức tổng quan về dự án |
| `PROJECT_ANALYSIS.md` | Phân tích chi tiết cấu trúc & logic |
| `INTERVIEW_QUESTIONS.md` | Câu hỏi phỏng vấn về dự án |
| `GIT_BRANCHING.md` | Hướng dẫn branching strategy |

---

## 👥 Đóng Góp

Mọi đóng góp đều được hoan nghênh! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

---

## 📄 License

Dự án này được phát hành dưới giấy phép ISC.

---

<p align="center">
  Made with ❤️ using React, Express, Prisma & PostgreSQL
</p>
