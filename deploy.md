---
description: Hướng dẫn deploy fullstack application
---

# Hướng dẫn Deploy Dự Án Bookstore

Dự án này bao gồm:
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: React + Vite + TypeScript

## Phương Án Deploy Được Đề Xuất

### Option 1: Deploy Miễn Phí (Khuyến Nghị Cho Học Tập)
- **Database**: Neon hoặc Supabase (PostgreSQL miễn phí)
- **Backend**: Railway hoặc Render (free tier)
- **Frontend**: Vercel hoặc Netlify (miễn phí)
- **File Upload**: Cloudinary (miễn phí)

### Option 2: Deploy Có Phí (Production)
- **VPS**: DigitalOcean, Linode, AWS EC2
- **Database**: Amazon RDS, DigitalOcean Managed Database
- **CDN**: Cloudflare

---

## PHẦN 1: CHUẨN BỊ

### 1. Tạo file .env.example cho Backend

Tạo file để người khác biết cần những biến môi trường gì:

```bash
cd backend
```

Tạo file `.env.example`:
```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=production

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS - Comma-separated list of allowed origins
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 2. Tạo file .env.example cho Frontend

```bash
cd ../frontend
```

Tạo file `.env.example`:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### 3. Cập nhật package.json của Backend

Thêm script để tương thích với môi trường production:

File: `backend/package.json`
```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/src/server.js",
    "postbuild": "prisma generate",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

---

## PHẦN 2: DEPLOY DATABASE (PostgreSQL)

### Option A: Sử dụng Neon (Miễn Phí - Khuyến Nghị)

1. Truy cập https://neon.tech
2. Đăng ký tài khoản (có thể dùng GitHub)
3. Tạo project mới với tên `bookstore-db`
4. Chọn region gần nhất (Singapore cho VN)
5. Copy **Connection String** (dạng: `postgresql://user:pass@host/dbname`)
6. Lưu lại để dùng cho bước tiếp theo

### Option B: Sử dụng Supabase

1. Truy cập https://supabase.com
2. Tạo project mới
3. Vào Settings > Database > Connection string
4. Copy connection string ở tab "URI"

### Option C: Railway

1. Truy cập https://railway.app
2. New Project > Provision PostgreSQL
3. Copy DATABASE_URL từ Variables tab

---

## PHẦN 3: DEPLOY BACKEND

### Option A: Deploy lên Railway (Miễn Phí - Khuyến Nghị)

#### 3.1. Chuẩn bị Backend

// turbo
1. Đảm bảo code đã được commit lên Git:
```bash
cd c:\Users\Khoa\Desktop\bookstore
git init
git add .
git commit -m "Prepare for deployment"
```

2. Push lên GitHub (tạo repo mới trên GitHub trước):
```bash
git remote add origin https://github.com/your-username/bookstore.git
git branch -M main
git push -u origin main
```

#### 3.2. Deploy trên Railway

1. Truy cập https://railway.app và đăng nhập
2. Click "New Project" > "Deploy from GitHub repo"
3. Chọn repository `bookstore`
4. Click vào service vừa tạo, chọn "Settings"
5. Trong "Root Directory", nhập: `backend`
6. Trong "Build Command", nhập: `npm install && npm run build && npx prisma generate`
7. Trong "Start Command", nhập: `npx prisma migrate deploy && npm start`

#### 3.3. Cấu hình Environment Variables

Click vào tab "Variables" và thêm:

```
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=production
PORT=3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Lưu ý**: 
- `DATABASE_URL`: Dùng connection string từ Neon/Supabase ở Phần 2
- `JWT_SECRET`: Tạo secret mạnh (có thể dùng: `openssl rand -base64 32`)
- `CORS_ALLOWED_ORIGINS`: Dùng http://localhost:5173 để test trước, sau sẽ update thành frontend URL production

#### 3.4. Deploy

1. Click "Deploy" hoặc Railway sẽ tự động deploy
2. Sau khi deploy xong, sẽ có URL dạng: `https://your-app.up.railway.app`
3. Test bằng cách truy cập: `https://your-app.up.railway.app/api/health` (nếu có endpoint này)

#### 3.5. Seed Database (Tùy chọn)

Nếu muốn có dữ liệu mẫu:
```bash
# Chạy local với DATABASE_URL của production
DATABASE_URL="your-production-db-url" npm run prisma:seed
```


### Option B: Deploy lên Render

1. Truy cập https://render.com
2. New > Web Service
3. Connect GitHub repository
4. Cấu hình:
   - **Name**: bookstore-api
   - **Root Directory**: backend
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && npm start`
5. Thêm Environment Variables (giống Railway)
6. Click "Create Web Service"

### Option C: Deploy lên VPS (Ubuntu)

Nếu bạn có VPS:

```bash
# 1. SSH vào VPS
ssh user@your-server-ip

# 2. Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Cài đặt PM2
sudo npm install -g pm2

# 4. Clone project
git clone https://github.com/your-username/bookstore.git
cd bookstore/backend

# 5. Tạo file .env
nano .env
# Paste các biến môi trường

# 6. Build và chạy
npm install
npm run build
npx prisma generate
npx prisma migrate deploy

# 7. Start với PM2
pm2 start dist/src/server.js --name bookstore-api
pm2 save
pm2 startup
```

---

## PHẦN 4: DEPLOY FRONTEND

### Option A: Deploy lên Vercel (Miễn Phí - Khuyến Nghị)

#### 4.1. Chuẩn bị Frontend

1. Cập nhật API URL trong `.env.production`:

Tạo file `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

Hoặc cấu hình trực tiếp trong Vercel.

#### 4.2. Deploy trên Vercel

1. Truy cập https://vercel.com và đăng nhập
2. Click "Add New" > "Project"
3. Import Git Repository (chọn repo bookstore)
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app/api
   ```
6. Click "Deploy"
7. Sau khi deploy xong, sẽ có URL: `https://your-app.vercel.app`

#### 4.3. Cập nhật CORS trong Backend

Quay lại Railway/Render, update biến `CORS_ALLOWED_ORIGINS`:
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Lưu ý**: Nếu bạn có nhiều domains (ví dụ: www và non-www), thêm cả hai:
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.your-app.vercel.app
```

Redeploy backend để áp dụng thay đổi.


### Option B: Deploy lên Netlify

1. Truy cập https://netlify.com
2. Sites > Add new site > Import from Git
3. Chọn repository
4. Cấu hình:
   - **Base directory**: frontend
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Environment variables:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app/api
   ```
6. Deploy

---

## PHẦN 5: KIỂM TRA VÀ XÁC NHẬN

### 5.1. Kiểm tra Backend

```bash
# Test health endpoint (nếu có)
curl https://your-backend-url.up.railway.app/api/health

# Test register
curl -X POST https://your-backend-url.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123!","fullName":"Test User"}'
```

### 5.2. Kiểm tra Frontend

1. Mở browser và truy cập: `https://your-app.vercel.app`
2. Kiểm tra:
   - [ ] Trang chủ load được
   - [ ] Đăng ký tài khoản mới
   - [ ] Đăng nhập
   - [ ] Xem danh sách sách
   - [ ] Thêm vào giỏ hàng
   - [ ] Tạo đơn hàng

### 5.3. Kiểm tra Database

1. Truy cập Neon/Supabase dashboard
2. Xem tables đã được tạo
3. Kiểm tra data đã được seed

---

## PHẦN 6: CẤU HÌNH NÂNG CAO

### 6.1. Custom Domain (Tùy chọn)

#### Cho Frontend (Vercel):
1. Mua domain từ Namecheap, GoDaddy, etc.
2. Trong Vercel: Settings > Domains
3. Add domain và config DNS theo hướng dẫn

#### Cho Backend (Railway):
1. Settings > Networking > Custom Domain
2. Add domain và config DNS

### 6.2. SSL Certificate

- Vercel/Netlify/Railway tự động cung cấp SSL miễn phí
- Nếu dùng VPS: Dùng Let's Encrypt với Certbot

### 6.3. Cloudinary Setup (Image Upload)

1. Truy cập https://cloudinary.com
2. Đăng ký tài khoản miễn phí
3. Dashboard > Account Details
4. Copy: Cloud Name, API Key, API Secret
5. Add vào Environment Variables của backend

### 6.4. Monitoring và Logging

#### Railway:
- Có sẵn logs trong dashboard
- Click vào deployment > View Logs

#### Thêm logging service (nâng cao):
- Sentry: https://sentry.io (error tracking)
- LogRocket: https://logrocket.com (session replay)

---

## PHẦN 7: BẢO MẬT VÀ TỐI ƯU

### 7.1. Checklist Bảo Mật

- [ ] JWT_SECRET phải đủ mạnh (>32 ký tự random)
- [ ] Database password phải mạnh
- [ ] CORS chỉ cho phép frontend domain cụ thể
- [ ] Rate limiting đã được bật
- [ ] Helmet middleware đã được sử dụng
- [ ] Environment variables không bị commit lên Git
- [ ] HTTPS được sử dụng cho cả frontend và backend

### 7.2. Performance Optimization

#### Backend:
```typescript
// Thêm compression middleware
import compression from 'compression';
app.use(compression());

// Enable Prisma query optimization
// File: backend/prisma/schema.prisma
// Add: 
// generator client {
//   provider = "prisma-client-js"
//   previewFeatures = ["fullTextSearch"]
// }
```

#### Frontend:
```typescript
// Lazy loading routes
const Home = lazy(() => import('./pages/Home'));
const Books = lazy(() => import('./pages/Books'));
```

### 7.3. Database Optimization

```sql
-- Add indexes for frequently queried fields
-- Chạy trong SQL Editor của Neon/Supabase

CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_publisher ON books(publisher_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_cart_items_book ON cart_items(book_id);
```

---

## PHẦN 8: MAINTENANCE VÀ UPDATES

### 8.1. Deploy Updates

Mỗi khi có thay đổi:

```bash
# 1. Commit changes
git add .
git commit -m "Update feature X"

# 2. Push to GitHub
git push origin main

# 3. Railway/Vercel sẽ tự động deploy
```

### 8.2. Database Migrations

Khi thay đổi schema:

```bash
# 1. Local development
npm run prisma:migrate

# 2. Trong Railway, migration sẽ chạy tự động vì có command:
# npx prisma migrate deploy
```

### 8.3. Rollback

#### Railway:
- Deployments tab > Click vào deployment cũ > Redeploy

#### Vercel:
- Deployments > Click vào deployment cũ > Promote to Production

---

## PHẦN 9: TROUBLESHOOTING

### Lỗi thường gặp:

#### 1. "CORS Error"
**Giải pháp**: Kiểm tra `CORS_ALLOWED_ORIGINS` trong backend env variables. Đảm bảo frontend URL đã được thêm vào danh sách (không có dấu / ở cuối)

#### 2. "Database connection failed"
**Giải pháp**: 
- Kiểm tra `DATABASE_URL` format đúng
- Đảm bảo database đang chạy
- Kiểm tra IP whitelist (Neon/Supabase)

#### 3. "Cannot find module"
**Giải pháp**:
- Chạy `npm run build` lại
- Đảm bảo `prisma generate` đã chạy

#### 4. "Port already in use"
**Giải pháp**: Railway/Render tự động assign port, không cần config

#### 5. "JWT Invalid"
**Giải pháp**: Đảm bảo `JWT_SECRET` giống nhau trong mọi deployment

---

## PHẦN 10: COST ESTIMATION

### Free Tier (Đủ cho học tập/demo):
- **Neon**: 0.5GB storage, 10GB transfer
- **Railway**: 500 hours/month, $5 credit
- **Vercel**: Unlimited bandwidth, 100GB/month
- **Cloudinary**: 25GB storage, 25GB bandwidth

### Paid Tier (Production nhỏ):
- **Railway**: ~$5-20/month
- **Neon**: ~$20/month (Pro plan)
- **Domain**: ~$10-15/year
- **Total**: ~$30-50/month

---

## KẾT LUẬN

Sau khi hoàn thành tất cả các bước trên, bạn sẽ có:

✅ **Backend deployed**: `https://your-api.railway.app`
✅ **Frontend deployed**: `https://your-app.vercel.app`
✅ **Database**: PostgreSQL trên cloud
✅ **CI/CD**: Auto-deploy khi push code
✅ **SSL**: HTTPS enabled
✅ **Monitoring**: Có thể xem logs

**Demo URLs để share:**
- Frontend: https://your-app.vercel.app
- API Docs: https://your-api.railway.app/api-docs (nếu có swagger)

**Next Steps:**
1. Thêm more features
2. Setup monitoring với Sentry
3. Add Google Analytics
4. Implement caching với Redis
5. Add email notifications
