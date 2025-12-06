# 📚 Bookstore API Documentation

Tài liệu mô tả tất cả các endpoints của Backend API.

**Base URL:** `/api`

---

## 📋 Mục lục

1. [Health Check](#health-check)
2. [Authentication (Xác thực)](#authentication-xác-thực)
3. [Books (Sách)](#books-sách)
4. [Categories (Danh mục)](#categories-danh-mục)
5. [Authors (Tác giả)](#authors-tác-giả)
6. [Publishers (Nhà xuất bản)](#publishers-nhà-xuất-bản)
7. [Cart (Giỏ hàng)](#cart-giỏ-hàng)
8. [Orders (Đơn hàng)](#orders-đơn-hàng)
9. [Ratings (Đánh giá)](#ratings-đánh-giá)
10. [Payment Methods (Phương thức thanh toán)](#payment-methods-phương-thức-thanh-toán)
11. [Payments (Thanh toán)](#payments-thanh-toán)
12. [Users (Quản lý người dùng)](#users-quản-lý-người-dùng)
13. [Analytics (Thống kê)](#analytics-thống-kê)
14. [Upload (Tải lên)](#upload-tải-lên)

---

## Health Check

| Method | Endpoint  | Mô tả               | Auth |
| ------ | --------- | ------------------- | ---- |
| GET    | `/health` | Kiểm tra trạng thái dịch vụ | ❌   |

**Response:**
```json
{
  "success": true,
  "data": { "status": "ok" },
  "message": "Service is healthy"
}
```

---

## Authentication (Xác thực)

**Base Path:** `/api/auth`

### Endpoints

| Method | Endpoint   | Mô tả                   | Auth  |
| ------ | ---------- | ----------------------- | ----- |
| POST   | `/register` | Đăng ký tài khoản mới   | ❌    |
| POST   | `/login`    | Đăng nhập              | ❌    |
| POST   | `/google`   | Đăng nhập bằng Google OAuth | ❌ |
| GET    | `/profile`  | Lấy thông tin profile   | ✅ User |
| PUT    | `/profile`  | Cập nhật thông tin profile | ✅ User |

### Request/Response Details

#### POST `/register` - Đăng ký

**Request Body:**
```json
{
  "username": "string (3-50 ký tự, bắt buộc)",
  "email": "string (email hợp lệ, bắt buộc)",
  "password": "string (tối thiểu 6 ký tự, bắt buộc)",
  "fullName": "string (2-100 ký tự, bắt buộc)",
  "phone": "string (8-15 số, có thể có '+' đầu, tùy chọn)",
  "address": "string (tùy chọn)",
  "position": "string (tùy chọn)"
}
```

#### POST `/login` - Đăng nhập

**Request Body:**
```json
{
  "email": "string (email hợp lệ, bắt buộc)",
  "password": "string (bắt buộc)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "JWT token",
    "user": { ... }
  }
}
```

#### POST `/google` - Đăng nhập bằng Google OAuth

**Request Body:**
```json
{
  "credential": "string (Google ID token, bắt buộc)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "JWT token",
    "user": { ... }
  }
}
```

> 💡 **Lưu ý:** Nếu user chưa tồn tại, hệ thống sẽ tự động tạo tài khoản mới dựa trên thông tin từ Google.

#### PUT `/profile` - Cập nhật Profile

**Request Body:**
```json
{
  "fullName": "string (2-100 ký tự, tùy chọn)",
  "phone": "string (8-15 số, tùy chọn)",
  "address": "string (tùy chọn)",
  "position": "string (tùy chọn)"
}
```

---

## Books (Sách)

**Base Path:** `/api/books`

### Endpoints

| Method | Endpoint | Mô tả                    | Auth       |
| ------ | -------- | ------------------------ | ---------- |
| GET    | `/`      | Lấy danh sách tất cả sách | ❌         |
| GET    | `/:id`   | Lấy thông tin chi tiết sách | ❌       |
| POST   | `/`      | Tạo sách mới             | ✅ Admin   |
| PATCH  | `/:id`   | Cập nhật thông tin sách  | ✅ Admin   |
| DELETE | `/:id`   | Xóa sách                 | ✅ Admin   |

### Request/Response Details

#### POST `/` - Tạo sách mới

**Request Body:**
```json
{
  "title": "string (bắt buộc)",
  "price": "number (số dương, bắt buộc)",
  "stock": "number (số nguyên >= 0, bắt buộc)",
  "description": "string (tùy chọn)",
  "imageUrl": "string (URL hợp lệ, tùy chọn)",
  "publisherId": "string (bắt buộc)",
  "categoryId": "string (bắt buộc)",
  "authorIds": ["string"] (mảng, tối thiểu 1 phần tử, bắt buộc)"
}
```

#### PATCH `/:id` - Cập nhật sách

**Request Body:** Tất cả các trường đều là tùy chọn (partial update)
```json
{
  "title": "string",
  "price": "number",
  "stock": "number",
  "description": "string",
  "imageUrl": "string",
  "publisherId": "string",
  "categoryId": "string",
  "authorIds": ["string"]
}
```

---

## Categories (Danh mục)

**Base Path:** `/api/categories`

### Endpoints

| Method | Endpoint | Mô tả                       | Auth       |
| ------ | -------- | --------------------------- | ---------- |
| GET    | `/`      | Lấy danh sách tất cả danh mục | ❌         |
| GET    | `/:id`   | Lấy thông tin chi tiết danh mục | ❌       |
| POST   | `/`      | Tạo danh mục mới            | ✅ Admin   |
| PATCH  | `/:id`   | Cập nhật danh mục           | ✅ Admin   |
| DELETE | `/:id`   | Xóa danh mục                | ✅ Admin   |

### Request/Response Details

#### POST `/` - Tạo danh mục mới

**Request Body:**
```json
{
  "name": "string (bắt buộc)",
  "parentCategoryId": "string (tùy chọn, ID danh mục cha)"
}
```

#### PATCH `/:id` - Cập nhật danh mục

**Request Body:**
```json
{
  "name": "string (tùy chọn)",
  "parentCategoryId": "string (tùy chọn)"
}
```

---

## Authors (Tác giả)

**Base Path:** `/api/authors`

### Endpoints

| Method | Endpoint | Mô tả                      | Auth       |
| ------ | -------- | -------------------------- | ---------- |
| GET    | `/`      | Lấy danh sách tất cả tác giả | ❌         |
| GET    | `/:id`   | Lấy thông tin chi tiết tác giả | ❌       |
| POST   | `/`      | Tạo tác giả mới            | ✅ Admin   |
| PATCH  | `/:id`   | Cập nhật tác giả           | ✅ Admin   |
| DELETE | `/:id`   | Xóa tác giả                | ✅ Admin   |

### Request/Response Details

#### POST/PATCH - Body

**Request Body:**
```json
{
  "name": "string (bắt buộc)"
}
```

---

## Publishers (Nhà xuất bản)

**Base Path:** `/api/publishers`

### Endpoints

| Method | Endpoint | Mô tả                          | Auth       |
| ------ | -------- | ------------------------------ | ---------- |
| GET    | `/`      | Lấy danh sách tất cả nhà xuất bản | ❌         |
| GET    | `/:id`   | Lấy thông tin chi tiết NXB     | ❌         |
| POST   | `/`      | Tạo NXB mới                    | ✅ Admin   |
| PATCH  | `/:id`   | Cập nhật NXB                   | ✅ Admin   |
| DELETE | `/:id`   | Xóa NXB                        | ✅ Admin   |

### Request/Response Details

#### POST/PATCH - Body

**Request Body:**
```json
{
  "name": "string (bắt buộc)"
}
```

---

## Cart (Giỏ hàng)

**Base Path:** `/api/cart`

> ⚠️ **Lưu ý:** Tất cả các endpoint trong module này yêu cầu xác thực người dùng.

### Endpoints

| Method | Endpoint        | Mô tả                    | Auth     |
| ------ | --------------- | ------------------------ | -------- |
| GET    | `/`             | Lấy giỏ hàng của user    | ✅ User  |
| POST   | `/`             | Thêm sản phẩm vào giỏ hàng | ✅ User |
| PATCH  | `/items/:itemId` | Cập nhật số lượng sản phẩm | ✅ User |
| DELETE | `/items/:itemId` | Xóa sản phẩm khỏi giỏ hàng | ✅ User |
| DELETE | `/`             | Xóa toàn bộ giỏ hàng     | ✅ User  |

### Request/Response Details

#### POST `/` - Thêm vào giỏ hàng

**Request Body:**
```json
{
  "bookId": "string (bắt buộc)",
  "quantity": "number (số nguyên dương, mặc định: 1)"
}
```

#### PATCH `/items/:itemId` - Cập nhật số lượng

**Request Body:**
```json
{
  "quantity": "number (số nguyên dương, bắt buộc)"
}
```

---

## Orders (Đơn hàng)

**Base Path:** `/api/orders`

> ⚠️ **Lưu ý:** Tất cả các endpoint trong module này yêu cầu xác thực người dùng.

### Endpoints

| Method | Endpoint      | Mô tả                           | Auth       |
| ------ | ------------- | ------------------------------- | ---------- |
| POST   | `/`           | Tạo đơn hàng mới                | ✅ User    |
| GET    | `/`           | Lấy danh sách đơn hàng của user | ✅ User    |
| GET    | `/all`        | Lấy tất cả đơn hàng (Admin)     | ✅ Admin   |
| GET    | `/:id`        | Lấy chi tiết đơn hàng           | ✅ User    |
| PATCH  | `/:id/status` | Cập nhật trạng thái đơn hàng    | ✅ Admin   |

### Request/Response Details

#### POST `/` - Tạo đơn hàng

**Request Body:**
```json
{
  "shippingAddress": "string (tối thiểu 10 ký tự, bắt buộc)",
  "paymentMethodId": "string (bắt buộc)"
}
```

#### PATCH `/:id/status` - Cập nhật trạng thái

**Request Body:**
```json
{
  "status": "PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED"
}
```

**Các trạng thái đơn hàng:**
- `PENDING` - Chờ xử lý
- `PROCESSING` - Đang xử lý
- `SHIPPED` - Đã giao cho vận chuyển
- `DELIVERED` - Đã giao hàng
- `CANCELLED` - Đã hủy

---

## Ratings (Đánh giá)

**Base Path:** `/api/ratings`

### Endpoints

| Method | Endpoint              | Mô tả                           | Auth       |
| ------ | --------------------- | ------------------------------- | ---------- |
| GET    | `/book/:bookId`       | Lấy đánh giá của sách           | ❌         |
| GET    | `/book/:bookId/average` | Lấy điểm trung bình của sách  | ❌         |
| GET    | `/my-ratings`         | Lấy tất cả đánh giá của user    | ✅ User    |
| GET    | `/my-rating/:bookId`  | Lấy đánh giá của user cho sách cụ thể | ✅ User |
| POST   | `/`                   | Tạo đánh giá mới                | ✅ User    |
| PATCH  | `/:id`                | Cập nhật đánh giá               | ✅ User    |
| DELETE | `/:id`                | Xóa đánh giá của user           | ✅ User    |
| GET    | `/all`                | Lấy tất cả đánh giá (Admin)     | ✅ Admin   |
| DELETE | `/admin/:id`          | Xóa đánh giá bất kỳ (Admin)     | ✅ Admin   |

### Request/Response Details

#### POST `/` - Tạo đánh giá

**Request Body:**
```json
{
  "bookId": "string (bắt buộc)",
  "stars": "number (1-5, bắt buộc)",
  "content": "string (tùy chọn)",
  "replaceIfExists": "boolean (tùy chọn, nếu true sẽ cập nhật đánh giá cũ thay vì tạo mới)"
}
```

#### PATCH `/:id` - Cập nhật đánh giá

**Request Body:**
```json
{
  "stars": "number (1-5, tùy chọn)",
  "content": "string (tùy chọn)"
}
```

---

## Payment Methods (Phương thức thanh toán)

**Base Path:** `/api/payment-methods`

### Endpoints

| Method | Endpoint | Mô tả                               | Auth       |
| ------ | -------- | ----------------------------------- | ---------- |
| GET    | `/`      | Lấy danh sách phương thức thanh toán | ❌         |
| GET    | `/:id`   | Lấy chi tiết phương thức thanh toán | ❌         |
| POST   | `/`      | Tạo phương thức thanh toán mới      | ✅ Admin   |
| PATCH  | `/:id`   | Cập nhật phương thức thanh toán     | ✅ Admin   |
| DELETE | `/:id`   | Xóa phương thức thanh toán          | ✅ Admin   |

### Request/Response Details

#### POST/PATCH - Body

**Request Body:**
```json
{
  "name": "string (bắt buộc)"
}
```

---

## Payments (Thanh toán)

**Base Path:** `/api/payments`

### Endpoints

| Method | Endpoint      | Mô tả                    | Auth     |
| ------ | ------------- | ------------------------ | -------- |
| POST   | `/:id/process` | Xử lý thanh toán đơn hàng | ✅ User  |

### Request/Response Details

#### POST `/:id/process` - Xử lý thanh toán

**Request Body:**
```json
{
  "status": "COMPLETED | FAILED"
}
```

**Các trạng thái thanh toán:**
- `COMPLETED` - Thanh toán thành công
- `FAILED` - Thanh toán thất bại

---

## Users (Quản lý người dùng)

**Base Path:** `/api/users`

> ⚠️ **Lưu ý:** Tất cả các endpoint trong module này chỉ dành cho Admin.

### Endpoints

| Method | Endpoint | Mô tả                        | Auth       |
| ------ | -------- | ---------------------------- | ---------- |
| GET    | `/`      | Lấy danh sách tất cả user    | ✅ Admin   |
| GET    | `/:id`   | Lấy thông tin chi tiết user  | ✅ Admin   |
| PATCH  | `/:id`   | Cập nhật thông tin user      | ✅ Admin   |
| DELETE | `/:id`   | Xóa user                     | ✅ Admin   |

### Request/Response Details

#### PATCH `/:id` - Cập nhật user

**Request Body:**
```json
{
  "fullName": "string (tùy chọn)",
  "email": "string (email hợp lệ, tùy chọn)",
  "phone": "string (tùy chọn)",
  "address": "string (tùy chọn)",
  "position": "string (tùy chọn)",
  "role": "USER | ADMIN (tùy chọn)"
}
```

---

## Analytics (Thống kê)

**Base Path:** `/api/analytics`

> ⚠️ **Lưu ý:** Tất cả các endpoint trong module này chỉ dành cho Admin.

### Endpoints

| Method | Endpoint           | Mô tả                          | Auth       |
| ------ | ------------------ | ------------------------------ | ---------- |
| GET    | `/revenue-by-month` | Lấy doanh thu theo tháng      | ✅ Admin   |
| GET    | `/orders-by-status` | Lấy số đơn hàng theo trạng thái | ✅ Admin |
| GET    | `/sales-by-category` | Lấy doanh số theo danh mục    | ✅ Admin   |
| GET    | `/top-customers`    | Lấy top khách hàng            | ✅ Admin   |
| GET    | `/dashboard-stats`  | Lấy thống kê tổng quan        | ✅ Admin   |

### Request/Response Details

#### GET `/revenue-by-month` - Doanh thu theo tháng

**Query Parameters:**
- `months` (optional): Số tháng muốn lấy dữ liệu (mặc định: 6)

**Response:**
```json
{
  "success": true,
  "data": [
    { "month": "2024-07", "revenue": 1500000 },
    { "month": "2024-08", "revenue": 2300000 }
  ]
}
```

#### GET `/orders-by-status` - Đơn hàng theo trạng thái

**Response:**
```json
{
  "success": true,
  "data": [
    { "status": "PENDING", "count": 5 },
    { "status": "PROCESSING", "count": 10 },
    { "status": "DELIVERED", "count": 45 }
  ]
}
```

#### GET `/sales-by-category` - Doanh số theo danh mục

**Response:**
```json
{
  "success": true,
  "data": [
    { "name": "Tiểu thuyết", "totalSales": 5000000, "itemCount": 150 },
    { "name": "Khoa học", "totalSales": 3200000, "itemCount": 80 }
  ]
}
```

#### GET `/top-customers` - Top khách hàng

**Query Parameters:**
- `limit` (optional): Số lượng khách hàng muốn lấy (mặc định: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "fullName": "Nguyễn Văn A",
      "email": "a@example.com",
      "totalSpent": 10000000,
      "orderCount": 25
    }
  ]
}
```

#### GET `/dashboard-stats` - Thống kê tổng quan Dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalBooks": 500,
    "totalOrders": 1200,
    "totalRevenue": 50000000
  }
}
```

---

## Upload (Tải lên)

**Base Path:** `/api/upload`

> ⚠️ **Lưu ý:** Tất cả các endpoint trong module này yêu cầu xác thực người dùng. Ảnh được lưu trữ trên Cloudinary.

### Endpoints

| Method | Endpoint       | Mô tả                    | Auth       |
| ------ | -------------- | ------------------------ | ---------- |
| POST   | `/avatar`      | Upload avatar cho user   | ✅ User    |
| POST   | `/book/:bookId` | Upload ảnh cho sách     | ✅ Admin   |
| POST   | `/image`       | Upload ảnh chung         | ✅ Admin   |
| DELETE | `/image`       | Xóa ảnh trên Cloudinary  | ✅ Admin   |

### Request/Response Details

#### POST `/avatar` - Upload avatar

**Request:**
- Content-Type: `multipart/form-data`
- Field: `avatar` (file ảnh)

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "user": { ... },
    "image": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "bookstore/avatars/..."
    }
  }
}
```

#### POST `/book/:bookId` - Upload ảnh sách

**Request:**
- Content-Type: `multipart/form-data`
- Field: `image` (file ảnh)
- Params: `bookId` (ID của sách)

**Response:**
```json
{
  "success": true,
  "message": "Book image uploaded successfully",
  "data": {
    "book": { ... },
    "image": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "bookstore/books/..."
    }
  }
}
```

#### POST `/image` - Upload ảnh chung

**Request:**
- Content-Type: `multipart/form-data`
- Field: `image` (file ảnh)
- Query: `type` (optional, loại ảnh: "avatar" | "book", mặc định: "book")

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "bookstore/..."
  }
}
```

#### DELETE `/image` - Xóa ảnh

**Request Body:**
```json
{
  "publicId": "string (Cloudinary public ID, bắt buộc)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

## 🔐 Authentication

Các endpoint yêu cầu xác thực cần gửi JWT token trong header:

```
Authorization: Bearer <token>
```

### Phân quyền

| Icon  | Mô tả                      |
| ----- | -------------------------- |
| ❌    | Không cần xác thực (Public) |
| ✅ User | Yêu cầu đăng nhập         |
| ✅ Admin | Yêu cầu quyền Admin      |

---

## 📝 Response Format

### Thành công

```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

### Lỗi

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## 🔢 HTTP Status Codes

| Code | Mô tả                        |
| ---- | ---------------------------- |
| 200  | OK - Thành công              |
| 201  | Created - Tạo mới thành công |
| 400  | Bad Request - Yêu cầu không hợp lệ |
| 401  | Unauthorized - Chưa xác thực |
| 403  | Forbidden - Không có quyền   |
| 404  | Not Found - Không tìm thấy   |
| 500  | Internal Server Error        |
