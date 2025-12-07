# 🎓 Project Deep Dive - Bookstore

## Lộ trình học và hiểu toàn bộ dự án Bookstore

---

## 📚 Mục lục

1. [Tổng quan dự án](#tổng-quan-dự-án)
2. [Tech Stack & Tại sao chọn](#tech-stack--tại-sao-chọn)
3. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
4. [Database Schema](#database-schema)
5. [Backend Deep Dive](#backend-deep-dive)
6. [Frontend Deep Dive](#frontend-deep-dive)
7. [Authentication Flow](#authentication-flow)
8. [Luồng dữ liệu](#luồng-dữ-liệu)
9. [API Architecture](#api-architecture)
10. [Lộ trình học](#lộ-trình-học)

---

## 🎯 Tổng quan dự án

### Bookstore là gì?
Một **ứng dụng web thương mại điện tử** bán sách với đầy đủ chức năng:

```
┌─────────────────────────────────────────────────────────────┐
│                        BOOKSTORE APP                         │
├──────────────────────────┬──────────────────────────────────┤
│      👤 USER SIDE        │         🔧 ADMIN SIDE            │
├──────────────────────────┼──────────────────────────────────┤
│ • Đăng ký/Đăng nhập     │ • Dashboard thống kê             │
│ • Google OAuth          │ • Quản lý sách (CRUD)            │
│ • Xem/Tìm kiếm sách     │ • Quản lý đơn hàng               │
│ • Thêm vào giỏ hàng     │ • Quản lý users                  │
│ • Đặt hàng/Thanh toán   │ • Quản lý categories             │
│ • Đánh giá sách         │ • Xem analytics                  │
│ • Xem lịch sử đơn hàng  │                                  │
│ • Quản lý profile       │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

### Các tính năng chính

| Module | Tính năng | Độ phức tạp |
|--------|-----------|-------------|
| **Auth** | JWT, Google OAuth, Forgot Password | ⭐⭐⭐ |
| **Books** | CRUD, Search, Filter, Related Books | ⭐⭐ |
| **Cart** | Add/Remove, Update Quantity | ⭐⭐ |
| **Orders** | Checkout, Order History, Status | ⭐⭐⭐ |
| **Ratings** | Stars, Review, Vote (Like/Dislike) | ⭐⭐ |
| **Payments** | Multiple methods, Status tracking | ⭐⭐ |
| **Admin** | Dashboard, Analytics, Management | ⭐⭐⭐ |

---

## 🛠️ Tech Stack & Tại sao chọn

### Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND STACK                         │
├─────────────────┬───────────────────────────────────────────┤
│ React 18        │ UI Library - Component-based, Virtual DOM │
│ TypeScript      │ Type safety, Better DX, Catch bugs early  │
│ Vite            │ Fast dev server, Quick HMR, ESM-based     │
│ React Router 6  │ Client-side routing, Nested routes        │
│ TanStack Query  │ Server state management, Caching, Sync    │
│ Axios           │ HTTP client, Interceptors, Error handling │
│ TailwindCSS     │ Utility-first CSS, Rapid UI development   │
│ Lucide React    │ Icon library, Tree-shakeable              │
│ React Hot Toast │ Notifications, UX feedback                │
│ Recharts        │ Data visualization, Charts                │
└─────────────────┴───────────────────────────────────────────┘
```

### Backend

```
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND STACK                          │
├─────────────────┬───────────────────────────────────────────┤
│ Node.js 20+     │ JavaScript runtime, Event-driven, Fast    │
│ Express 5       │ Web framework, Middleware, Routing        │
│ TypeScript      │ Type safety, Better maintainability       │
│ Prisma          │ ORM, Type-safe queries, Migrations        │
│ PostgreSQL      │ Relational DB, ACID, JSON support         │
│ JWT             │ Stateless authentication, Secure          │
│ Zod             │ Schema validation, Type inference         │
│ Cloudinary      │ Image hosting, Optimization               │
│ Resend          │ Email service, Password reset             │
│ bcryptjs        │ Password hashing, Security                │
└─────────────────┴───────────────────────────────────────────┘
```

### Tại sao chọn những công nghệ này?

#### React + Vite (không dùng CRA)
```
CRA (Create React App)     vs     Vite
─────────────────────────────────────────
❌ Slow startup (Webpack)         ✅ Fast startup (ESBuild)
❌ Slow HMR                       ✅ Instant HMR
❌ Large bundle                   ✅ Optimized bundle
❌ Deprecated                     ✅ Actively maintained
```

#### TanStack Query (không dùng Redux)
```
Redux                      vs     TanStack Query
─────────────────────────────────────────────────
❌ Boilerplate heavy              ✅ Minimal boilerplate
❌ Manual caching                 ✅ Auto caching
❌ Manual sync                    ✅ Auto refetch
❌ Global state for server data   ✅ Purpose-built for server state
```

#### Prisma (không dùng Sequelize/TypeORM)
```
Sequelize/TypeORM          vs     Prisma
─────────────────────────────────────────
❌ Manual types                   ✅ Auto generated types
❌ Complex queries                ✅ Intuitive query API
❌ Migration complexity           ✅ Simple migrations
❌ Poor TypeScript support        ✅ First-class TS support
```

---

## 🏗️ Kiến trúc hệ thống

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT SIDE                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                         BROWSER                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │
│  │  │   React     │  │   Router    │  │   TanStack Query    │   │  │
│  │  │   Components│  │   (Pages)   │  │   (Server State)    │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘   │  │
│  │         │                │                     │              │  │
│  │         └────────────────┼─────────────────────┘              │  │
│  │                          │                                     │  │
│  │                    ┌─────▼─────┐                              │  │
│  │                    │   Axios   │                              │  │
│  │                    │   (HTTP)  │                              │  │
│  │                    └─────┬─────┘                              │  │
│  └──────────────────────────┼────────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              │ HTTPS (REST API)
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                            SERVER SIDE                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      EXPRESS SERVER                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │
│  │  │  Middleware │  │   Routes    │  │    Controllers      │   │  │
│  │  │  (Auth,CORS)│  │   (/api/*)  │  │    (Logic)          │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘   │  │
│  │         │                │                     │              │  │
│  │         └────────────────┼─────────────────────┘              │  │
│  │                          │                                     │  │
│  │                    ┌─────▼─────┐                              │  │
│  │                    │  Services │                              │  │
│  │                    │  (CRUD)   │                              │  │
│  │                    └─────┬─────┘                              │  │
│  │                          │                                     │  │
│  │                    ┌─────▼─────┐                              │  │
│  │                    │  Prisma   │                              │  │
│  │                    │  (ORM)    │                              │  │
│  │                    └─────┬─────┘                              │  │
│  └──────────────────────────┼────────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              │ SQL Queries
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                           DATABASE                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      POSTGRESQL                                │  │
│  │                                                                │  │
│  │   users  books  orders  carts  ratings  payments  ...         │  │
│  │                                                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Cấu trúc thư mục

```
bookstore/
├── 📁 frontend/                    # React Application
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable UI components
│   │   │   ├── BookCard.tsx        # Card hiển thị sách
│   │   │   ├── Navbar.tsx          # Navigation bar
│   │   │   ├── Footer.tsx          # Footer
│   │   │   ├── ProtectedRoute.tsx  # Route guard
│   │   │   ├── SkeletonLoaders.tsx # Loading skeletons
│   │   │   └── ...
│   │   │
│   │   ├── 📁 pages/               # Page components (Routes)
│   │   │   ├── Home.tsx            # Trang chủ
│   │   │   ├── Books.tsx           # Danh sách sách
│   │   │   ├── BookDetail.tsx      # Chi tiết sách
│   │   │   ├── Cart.tsx            # Giỏ hàng
│   │   │   ├── Login.tsx           # Đăng nhập
│   │   │   ├── Register.tsx        # Đăng ký
│   │   │   ├── Profile.tsx         # Thông tin user
│   │   │   ├── Orders.tsx          # Lịch sử đơn hàng
│   │   │   └── 📁 admin/           # Admin pages
│   │   │       ├── Dashboard.tsx   # Admin dashboard
│   │   │       ├── AdminBooks.tsx  # Quản lý sách
│   │   │       └── AdminOrders.tsx # Quản lý đơn hàng
│   │   │
│   │   ├── 📁 contexts/            # React Contexts
│   │   │   └── AuthContext.tsx     # Authentication state
│   │   │
│   │   ├── 📁 lib/                 # Utilities
│   │   │   └── api.ts              # Axios instance & API calls
│   │   │
│   │   ├── 📁 types/               # TypeScript types
│   │   │   └── index.ts            # Shared interfaces
│   │   │
│   │   ├── App.tsx                 # Main App component
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── 📁 backend/                     # Express Application
│   ├── 📁 src/
│   │   ├── 📁 config/              # Configuration
│   │   │   ├── database.ts         # Prisma client instance
│   │   │   ├── cloudinary.ts       # Cloudinary config
│   │   │   ├── env.ts              # Environment variables
│   │   │   └── resend.ts           # Email service
│   │   │
│   │   ├── 📁 middleware/          # Express middlewares
│   │   │   ├── auth.ts             # JWT verification
│   │   │   ├── admin.ts            # Admin role check
│   │   │   └── upload.ts           # File upload (Multer)
│   │   │
│   │   ├── 📁 modules/             # Feature modules
│   │   │   ├── 📁 auth/            # Authentication
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.dto.ts     # Data Transfer Objects
│   │   │   │
│   │   │   ├── 📁 books/           # Books CRUD
│   │   │   ├── 📁 cart/            # Shopping cart
│   │   │   ├── 📁 orders/          # Order management
│   │   │   ├── 📁 ratings/         # Reviews & ratings
│   │   │   ├── 📁 users/           # User management
│   │   │   ├── 📁 categories/      # Category management
│   │   │   ├── 📁 authors/         # Author management
│   │   │   ├── 📁 publishers/      # Publisher management
│   │   │   ├── 📁 payments/        # Payment processing
│   │   │   └── 📁 analytics/       # Dashboard analytics
│   │   │
│   │   ├── 📁 utils/               # Utilities
│   │   │   ├── jwt.ts              # JWT helpers
│   │   │   ├── logger.ts           # Logging
│   │   │   └── response.ts         # API response helpers
│   │   │
│   │   ├── app.ts                  # Express app setup
│   │   └── server.ts               # Server entry point
│   │
│   ├── 📁 prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── seed.ts                 # Seed data
│   │   └── 📁 migrations/          # Database migrations
│   │
│   └── package.json
│
├── 📁 docs/                        # Documentation
│   ├── CI_CD_GUIDE.md
│   └── PROJECT_DEEP_DIVE.md
│
└── README.md
```

---

## 🗃️ Database Schema

### Entity Relationship Diagram (ERD)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │     │    Cart     │     │  CartItem   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │────►│ id (PK)     │────►│ id (PK)     │
│ username    │     │ userId (FK) │     │ cartId (FK) │
│ email       │     │ total       │     │ bookId (FK) │
│ password    │     └─────────────┘     │ quantity    │
│ fullName    │                          └─────────────┘
│ phone       │                                │
│ address     │                                │
│ role        │                                │
│ googleId    │                                ▼
│ avatar      │     ┌─────────────┐     ┌─────────────┐
└─────────────┘     │    Book     │◄────│ BookAuthor  │
       │            ├─────────────┤     ├─────────────┤
       │            │ id (PK)     │     │ bookId (FK) │
       ▼            │ title       │     │ authorId(FK)│
┌─────────────┐     │ price       │     └─────────────┘
│   Order     │     │ stock       │            │
├─────────────┤     │ description │            ▼
│ id (PK)     │     │ imageUrl    │     ┌─────────────┐
│ userId (FK) │     │ publisherId │     │   Author    │
│ confirmedBy │     │ categoryId  │     ├─────────────┤
│ total       │     └─────────────┘     │ id (PK)     │
│ status      │            │            │ name        │
│ shippingAddr│            ▼            └─────────────┘
└─────────────┘     ┌─────────────┐
       │            │  Publisher  │     ┌─────────────┐
       ▼            ├─────────────┤     │  Category   │
┌─────────────┐     │ id (PK)     │     ├─────────────┤
│ OrderItem   │     │ name        │     │ id (PK)     │
├─────────────┤     └─────────────┘     │ name        │
│ id (PK)     │                          │ parentId    │◄─┐
│ orderId (FK)│     ┌─────────────┐     └─────────────┘  │
│ bookId (FK) │     │   Rating    │            │         │
│ quantity    │     ├─────────────┤            └─────────┘
│ price       │     │ id (PK)     │         (Self-relation)
└─────────────┘     │ userId (FK) │
       │            │ bookId (FK) │     ┌─────────────┐
       ▼            │ stars       │     │ RatingVote  │
┌─────────────┐     │ content     │────►├─────────────┤
│  Payment    │     └─────────────┘     │ ratingId(FK)│
├─────────────┤                          │ userId (FK) │
│ id (PK)     │     ┌─────────────┐     │ voteType    │
│ orderId (FK)│     │PaymentMethod│     └─────────────┘
│ methodId(FK)│◄────├─────────────┤
│ status      │     │ id (PK)     │
│ total       │     │ name        │
│ paymentDate │     └─────────────┘
└─────────────┘
```

### Các quan hệ quan trọng

```typescript
// 1. User - Cart: One-to-One
User {
  cart: Cart?    // Mỗi user có 1 cart
}

// 2. User - Order: One-to-Many
User {
  orders: Order[]           // User tạo nhiều order
  confirmedOrders: Order[]  // Admin confirm nhiều order
}

// 3. Book - Author: Many-to-Many (qua BookAuthor)
Book {
  authors: BookAuthor[]
}
Author {
  books: BookAuthor[]
}

// 4. Category - Category: Self-Relation (Parent-Child)
Category {
  parentCategory: Category?
  subCategories: Category[]
}

// 5. Order - OrderItem - Book: One-to-Many
Order {
  items: OrderItem[]  // Order có nhiều items
}
OrderItem {
  book: Book         // Mỗi item là 1 sách
}
```

### Enums

```prisma
enum Role {
  ADMIN    // Quản trị viên
  USER     // Người dùng thường
}

enum OrderStatus {
  PENDING     // Chờ xác nhận
  PROCESSING  // Đang xử lý
  SHIPPED     // Đang giao
  DELIVERED   // Đã giao
  CANCELLED   // Đã hủy
}

enum PaymentStatus {
  PENDING    // Chờ thanh toán
  COMPLETED  // Đã thanh toán
  FAILED     // Thất bại
  REFUNDED   // Đã hoàn tiền
}
```

---

## 🖥️ Backend Deep Dive

### Luồng xử lý Request

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                      EXPRESS APP                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. MIDDLEWARE PIPELINE                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  helmet()          → Security headers               │    │
│  │  cors()            → Cross-Origin handling          │    │
│  │  express.json()    → Parse JSON body               │    │
│  │  express.static()  → Serve static files             │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  2. ROUTES                                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  /api/auth/*       → authRoutes                     │    │
│  │  /api/books/*      → bookRoutes                     │    │
│  │  /api/cart/*       → cartRoutes (+ authMiddleware)  │    │
│  │  /api/orders/*     → orderRoutes (+ authMiddleware) │    │
│  │  /api/admin/*      → adminRoutes (+ adminMiddleware)│    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  3. CONTROLLER (Handle Request)                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - Validate input (Zod)                             │    │
│  │  - Call Service                                      │    │
│  │  - Return Response                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  4. SERVICE (Business Logic)                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - Perform CRUD operations                          │    │
│  │  - Apply business rules                             │    │
│  │  - Handle errors                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  5. PRISMA (Database Access)                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - Execute queries                                   │    │
│  │  - Return data                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
HTTP Response
```

### Module Pattern

Mỗi feature được tổ chức thành module với 4 files:

```
modules/books/
├── book.routes.ts      # Định nghĩa endpoints
├── book.controller.ts  # Xử lý request/response
├── book.service.ts     # Business logic
└── book.dto.ts         # Data Transfer Objects (validation)
```

#### Ví dụ: Book Module

**1. book.routes.ts** - Định nghĩa API endpoints
```typescript
import { Router } from 'express';
import { BookController } from './book.controller';
import { authMiddleware, adminMiddleware } from '../../middleware';

const router = Router();
const controller = new BookController();

// Public routes
router.get('/', controller.getAll);           // GET /api/books
router.get('/:id', controller.getById);       // GET /api/books/:id

// Admin routes
router.post('/', authMiddleware, adminMiddleware, controller.create);
router.put('/:id', authMiddleware, adminMiddleware, controller.update);
router.delete('/:id', authMiddleware, adminMiddleware, controller.delete);

export default router;
```

**2. book.controller.ts** - Xử lý HTTP request
```typescript
import { Request, Response } from 'express';
import { BookService } from './book.service';
import { CreateBookSchema, UpdateBookSchema } from './book.dto';

export class BookController {
  private bookService = new BookService();

  getAll = async (req: Request, res: Response) => {
    try {
      const { categoryId, search, sortBy, order } = req.query;
      const books = await this.bookService.findAll({
        categoryId: categoryId as string,
        search: search as string,
        sortBy: sortBy as 'price' | 'rating',
        order: order as 'asc' | 'desc',
      });
      res.json({ success: true, data: books });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      // Validate input với Zod
      const validated = CreateBookSchema.parse(req.body);
      const book = await this.bookService.create(validated);
      res.status(201).json({ success: true, data: book });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
```

**3. book.service.ts** - Business logic
```typescript
import prisma from '../../config/database';
import { CreateBookInput, UpdateBookInput } from './book.dto';

export class BookService {
  async findAll(params: { categoryId?: string; search?: string }) {
    const where: any = {};
    
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }
    
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        category: true,
        publisher: true,
        authors: { include: { author: true } },
      },
    });

    return books;
  }

  async create(data: CreateBookInput) {
    const { authorIds, ...bookData } = data;
    
    return prisma.book.create({
      data: {
        ...bookData,
        authors: {
          create: authorIds.map(id => ({
            author: { connect: { id } }
          }))
        }
      },
      include: {
        category: true,
        authors: { include: { author: true } }
      }
    });
  }
}
```

**4. book.dto.ts** - Validation schemas
```typescript
import { z } from 'zod';

export const CreateBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0).default(0),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  publisherId: z.string().cuid(),
  categoryId: z.string().cuid(),
  authorIds: z.array(z.string().cuid()).min(1, 'At least one author required'),
});

export type CreateBookInput = z.infer<typeof CreateBookSchema>;
```

### Middleware Chi tiết

**Auth Middleware** - Xác thực JWT
```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Lấy token từ header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
    };

    // 3. Gắn user info vào request
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

**Admin Middleware** - Kiểm tra quyền admin
```typescript
// middleware/admin.ts
export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

---

## 🌐 Frontend Deep Dive

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Providers                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │ GoogleOAuth │  │   Query     │  │    Auth     │   │  │
│  │  │  Provider   │  │   Client    │  │   Context   │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   BrowserRouter                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │                    Routes                        │  │  │
│  │  │                                                  │  │  │
│  │  │  /              → Home                          │  │  │
│  │  │  /books         → Books                         │  │  │
│  │  │  /books/:id     → BookDetail                    │  │  │
│  │  │  /cart          → Cart (Protected)              │  │  │
│  │  │  /orders        → Orders (Protected)            │  │  │
│  │  │  /profile       → Profile (Protected)           │  │  │
│  │  │  /admin/*       → Admin Pages (Admin Only)      │  │  │
│  │  │                                                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### AuthContext - State Management

```typescript
// contexts/AuthContext.tsx

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  googleLogin: (credential: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')  // Persist token
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile on mount or token change
  useEffect(() => {
    if (token) {
      api.getProfile()
        .then(res => setUser(res.data))
        .catch(() => logout())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, ... }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### API Layer (lib/api.ts)

```typescript
import axios from 'axios';

// Create axios instance với base config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào mọi request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const api = {
  // Auth
  login: (data: LoginData) => axiosInstance.post('/api/auth/login', data),
  register: (data: RegisterData) => axiosInstance.post('/api/auth/register', data),
  getProfile: () => axiosInstance.get('/api/auth/profile'),
  
  // Books
  getBooks: (params?: BookParams) => axiosInstance.get('/api/books', { params }),
  getBookById: (id: string) => axiosInstance.get(`/api/books/${id}`),
  
  // Cart
  getCart: () => axiosInstance.get('/api/cart'),
  addToCart: (data: { bookId: string; quantity: number }) => 
    axiosInstance.post('/api/cart', data),
  updateCartItem: (itemId: string, quantity: number) =>
    axiosInstance.put(`/api/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId: string) =>
    axiosInstance.delete(`/api/cart/${itemId}`),
    
  // Orders
  createOrder: (data: CreateOrderData) => axiosInstance.post('/api/orders', data),
  getOrders: () => axiosInstance.get('/api/orders'),
  
  // ... more API calls
};
```

### TanStack Query Usage

```typescript
// Trong component Books.tsx

function Books() {
  // Fetch books với caching tự động
  const { 
    data: booksData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['books', filters],  // Cache key
    queryFn: () => api.getBooks(filters),
    staleTime: 1000 * 60 * 5,  // 5 phút trước khi refetch
  });

  // Mutation cho add to cart
  const addToCartMutation = useMutation({
    mutationFn: (bookId: string) => api.addToCart({ bookId, quantity: 1 }),
    onSuccess: () => {
      // Invalidate cache để refetch cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) return <BookGridSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid grid-cols-4 gap-4">
      {booksData?.data.map(book => (
        <BookCard 
          key={book.id} 
          book={book}
          onAddToCart={() => addToCartMutation.mutate(book.id)}
        />
      ))}
    </div>
  );
}
```

### Protected Route Pattern

```typescript
// components/ProtectedRoute.tsx

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Đang load user
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Chưa đăng nhập → redirect tới login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cần role admin nhưng user không phải admin
  if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Sử dụng trong App.tsx
<Route 
  path="/cart" 
  element={
    <ProtectedRoute>
      <Cart />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout />
    </ProtectedRoute>
  } 
/>
```

---

## 🔐 Authentication Flow

### Login Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                                   │
└─────────────────────────────────────────────────────────────────────┘

     👤 User                    🌐 Frontend                   🖥️ Backend

        │                           │                             │
        │  1. Enter email/password  │                             │
        │ ─────────────────────────►│                             │
        │                           │                             │
        │                           │  2. POST /api/auth/login    │
        │                           │ ───────────────────────────►│
        │                           │     { email, password }     │
        │                           │                             │
        │                           │                      3. Validate email
        │                           │                      4. Compare password (bcrypt)
        │                           │                      5. Generate JWT token
        │                           │                             │
        │                           │  6. Return { token, user }  │
        │                           │ ◄───────────────────────────│
        │                           │                             │
        │                    7. Store token in localStorage       │
        │                    8. Update AuthContext                │
        │                    9. Redirect to home                  │
        │                           │                             │
        │  10. Show logged in UI    │                             │
        │ ◄─────────────────────────│                             │
        │                           │                             │

     ════════════════════════════════════════════════════════════════

                      SUBSEQUENT REQUESTS

        │                           │                             │
        │  Request protected page   │                             │
        │ ─────────────────────────►│                             │
        │                           │                             │
        │                           │  GET /api/cart              │
        │                           │  Authorization: Bearer xxx  │
        │                           │ ───────────────────────────►│
        │                           │                      11. Verify JWT
        │                           │                      12. Extract userId
        │                           │                      13. Fetch user's cart
        │                           │                             │
        │                           │  Return cart data           │
        │                           │ ◄───────────────────────────│
        │                           │                             │
        │  Show cart                │                             │
        │ ◄─────────────────────────│                             │
```

### Google OAuth Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      GOOGLE OAUTH FLOW                               │
└─────────────────────────────────────────────────────────────────────┘

  👤 User         🌐 Frontend         🔑 Google          🖥️ Backend

     │                │                   │                   │
     │ 1. Click       │                   │                   │
     │ "Login Google" │                   │                   │
     │ ──────────────►│                   │                   │
     │                │                   │                   │
     │                │ 2. Open Google    │                   │
     │                │    OAuth popup    │                   │
     │                │ ─────────────────►│                   │
     │                │                   │                   │
     │       3. User selects account      │                   │
     │ ──────────────────────────────────►│                   │
     │                │                   │                   │
     │                │ 4. Google returns │                   │
     │                │    credential     │                   │
     │                │ ◄─────────────────│                   │
     │                │                   │                   │
     │                │ 5. POST /api/auth/google              │
     │                │    { credential }                     │
     │                │ ──────────────────────────────────────►
     │                │                   │                   │
     │                │                   │    6. Verify credential
     │                │                   │       with Google
     │                │                   │ ◄─────────────────│
     │                │                   │                   │
     │                │                   │    7. Find or create user
     │                │                   │    8. Generate JWT
     │                │                   │                   │
     │                │ 9. Return { token, user }             │
     │                │ ◄─────────────────────────────────────│
     │                │                   │                   │
     │           10. Same as normal login │                   │
     │ ◄──────────────│                   │                   │
```

---

## 🔄 Luồng dữ liệu

### Checkout Flow (Complex Example)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CHECKOUT FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

  Cart Page                  Backend                    Database
     │                          │                          │
     │  1. User clicks         │                          │
     │     "Checkout"          │                          │
     │                         │                          │
     ├──────────────────────────────────────────────────────────────┐
     │                   VALIDATION PHASE                           │
     ├──────────────────────────────────────────────────────────────┘
     │                         │                          │
     │  2. POST /orders        │                          │
     │  {                      │                          │
     │    cartItemIds: [...],  │                          │
     │    shippingAddress,     │                          │
     │    paymentMethodId      │                          │
     │  }                      │                          │
     │ ───────────────────────►│                          │
     │                         │                          │
     │                  3. Validate:                      │
     │                     - User exists                  │
     │                     - Cart items exist             │
     │                     - Stock available              │
     │                         │                          │
     │                         │  4. Check stock          │
     │                         │ ────────────────────────►│
     │                         │ ◄────────────────────────│
     │                         │                          │
     ├──────────────────────────────────────────────────────────────┐
     │                   TRANSACTION PHASE                          │
     ├──────────────────────────────────────────────────────────────┘
     │                         │                          │
     │                  5. BEGIN TRANSACTION              │
     │                         │                          │
     │                         │  6. Create Order         │
     │                         │ ────────────────────────►│
     │                         │                          │
     │                         │  7. Create OrderItems    │
     │                         │ ────────────────────────►│
     │                         │                          │
     │                         │  8. Create Payment       │
     │                         │ ────────────────────────►│
     │                         │                          │
     │                         │  9. Decrease stock       │
     │                         │ ────────────────────────►│
     │                         │                          │
     │                         │  10. Delete cart items   │
     │                         │ ────────────────────────►│
     │                         │                          │
     │                  11. COMMIT TRANSACTION            │
     │                         │                          │
     ├──────────────────────────────────────────────────────────────┐
     │                   RESPONSE PHASE                             │
     ├──────────────────────────────────────────────────────────────┘
     │                         │                          │
     │  12. Return order       │                          │
     │ ◄───────────────────────│                          │
     │                         │                          │
     │  13. Invalidate cache:  │                          │
     │      - cart             │                          │
     │      - orders           │                          │
     │                         │                          │
     │  14. Show success toast │                          │
     │  15. Redirect to orders │                          │
```

### Prisma Transaction Code

```typescript
// order.service.ts
async createOrder(userId: string, data: CreateOrderInput) {
  const { cartItemIds, shippingAddress, paymentMethodId } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Get cart items
    const cartItems = await tx.cartItem.findMany({
      where: { id: { in: cartItemIds } },
      include: { book: true },
    });

    // 2. Validate stock
    for (const item of cartItems) {
      if (item.book.stock < item.quantity) {
        throw new Error(`Not enough stock for ${item.book.title}`);
      }
    }

    // 3. Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );

    // 4. Create order
    const order = await tx.order.create({
      data: {
        userId,
        shippingAddress,
        total,
        status: 'PENDING',
        items: {
          create: cartItems.map(item => ({
            bookId: item.bookId,
            quantity: item.quantity,
            price: item.book.price,
          })),
        },
        payment: {
          create: {
            paymentMethodId,
            total,
            status: 'PENDING',
          },
        },
      },
    });

    // 5. Decrease stock
    for (const item of cartItems) {
      await tx.book.update({
        where: { id: item.bookId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 6. Clear cart items
    await tx.cartItem.deleteMany({
      where: { id: { in: cartItemIds } },
    });

    return order;
  });
}
```

---

## 📖 API Architecture

### RESTful Conventions

```
┌────────────────────────────────────────────────────────────────────┐
│                      API ENDPOINT PATTERNS                          │
├──────────────┬──────────────────────────────────────┬──────────────┤
│    Method    │              Endpoint                 │    Action    │
├──────────────┼──────────────────────────────────────┼──────────────┤
│    GET       │  /api/books                          │  List all    │
│    GET       │  /api/books/:id                      │  Get one     │
│    POST      │  /api/books                          │  Create      │
│    PUT       │  /api/books/:id                      │  Update      │
│    DELETE    │  /api/books/:id                      │  Delete      │
├──────────────┼──────────────────────────────────────┼──────────────┤
│    GET       │  /api/books?category=xxx&search=yyy  │  Filter      │
│    GET       │  /api/books/:id/ratings              │  Nested      │
│    POST      │  /api/books/:id/ratings              │  Nested      │
├──────────────┼──────────────────────────────────────┼──────────────┤
│    GET       │  /api/cart                           │  Get cart    │
│    POST      │  /api/cart                           │  Add item    │
│    PUT       │  /api/cart/:itemId                   │  Update qty  │
│    DELETE    │  /api/cart/:itemId                   │  Remove item │
└──────────────┴──────────────────────────────────────┴──────────────┘
```

### Response Format

```typescript
// Success Response
{
  success: true,
  data: { ... },         // hoặc [...]
  message?: "Optional message"
}

// Error Response
{
  success: false,
  message: "Error description",
  errors?: [             // Validation errors
    { field: "email", message: "Invalid email" }
  ]
}

// Paginated Response
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
}
```

---

## 📚 Lộ trình học

### Phase 1: Hiểu tổng quan (1-2 ngày)

```
□ Đọc README.md
□ Chạy project locally
  □ Frontend: npm run dev (port 5173)
  □ Backend: npm run dev (port 3000)
□ Duyệt qua UI, thử các chức năng
  □ Đăng ký/Đăng nhập
  □ Xem sách, filter, search
  □ Thêm vào giỏ, checkout
  □ Đánh giá sách
  □ Admin dashboard
□ Đọc file này (PROJECT_DEEP_DIVE.md)
```

### Phase 2: Database & Prisma (2-3 ngày)

```
□ Đọc schema.prisma - hiểu các models
□ Vẽ lại ERD trên giấy
□ Chạy prisma studio: npx prisma studio
□ Thử viết queries:
  □ Tìm tất cả sách của 1 category
  □ Tính trung bình rating của 1 sách
  □ Lấy orders của 1 user với items
□ Hiểu migrations:
  □ npx prisma migrate dev
  □ npx prisma migrate deploy
```

### Phase 3: Backend (3-5 ngày)

```
□ Hiểu Express app setup (app.ts)
□ Trace 1 request từ đầu đến cuối:
  □ Route → Controller → Service → Prisma
□ Hiểu middleware chain
□ Hiểu authentication:
  □ JWT là gì?
  □ Cách verify token
  □ Cách hash password
□ Thử tự viết 1 module mới (ví dụ: Wishlist)
```

### Phase 4: Frontend (3-5 ngày)

```
□ Hiểu React component tree
□ Hiểu React Router setup
□ Hiểu AuthContext:
  □ Tại sao dùng Context?
  □ Token được lưu ở đâu?
□ Hiểu TanStack Query:
  □ useQuery vs useMutation
  □ Cache invalidation
□ Hiểu Axios interceptors
□ Thử thêm 1 trang mới
```

### Phase 5: Advanced (ongoing)

```
□ CI/CD với GitHub Actions
□ Testing:
  □ Unit tests (Vitest/Jest)
  □ Integration tests
  □ E2E tests (Playwright)
□ Performance optimization
□ Security best practices
□ Monitoring & Logging
```

---

## 🔧 Các lệnh thường dùng

### Backend

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Prisma
npx prisma studio              # Open Prisma Studio (GUI)
npx prisma generate            # Generate Prisma client
npx prisma migrate dev         # Create migration (dev)
npx prisma migrate deploy      # Apply migrations (prod)
npx prisma db push             # Push schema (skip migration)
npm run prisma:seed            # Run seed script

# Debug
npx prisma format              # Format schema.prisma
```

### Frontend

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build
npm run lint                   # Run ESLint

# Type checking
npx tsc --noEmit               # Check types without build
```

---

## 🎯 Tips & Best Practices

### 1. Debugging

```typescript
// Backend: Enable debug logs
console.log('Incoming request:', req.body);
console.log('User from token:', req.user);

// Frontend: React Query DevTools
// Đã được thêm sẵn, mở browser DevTools → React Query tab

// Prisma: Log queries
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

### 2. Error Handling Pattern

```typescript
// Backend
try {
  // ... logic
} catch (error) {
  if (error instanceof ZodError) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation error',
      errors: error.errors 
    });
  }
  console.error('Unexpected error:', error);
  return res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
}

// Frontend
const { error } = useQuery({ ... });
if (error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 'Something went wrong';
    toast.error(message);
  }
}
```

### 3. Type Safety

```typescript
// Share types between frontend & backend
// Có thể tạo shared package hoặc copy types

// Backend: Infer types from Prisma
import { Prisma } from '@prisma/client';

type BookWithRelations = Prisma.BookGetPayload<{
  include: {
    category: true;
    authors: { include: { author: true } };
  };
}>;

// Frontend: Define matching types
interface Book {
  id: string;
  title: string;
  price: number;
  category: Category;
  authors: { author: Author }[];
}
```

---

## 📚 Tài liệu tham khảo

### Official Docs
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [TailwindCSS](https://tailwindcss.com/docs)

### Tutorials
- [Full Stack Open](https://fullstackopen.com/) - Free bootcamp
- [JWT Authentication](https://jwt.io/introduction)
- [REST API Design](https://restfulapi.net/)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [Postman](https://www.postman.com/) - API testing
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

*Created for Bookstore Project - December 2024*
*Cập nhật khi có thay đổi lớn*
