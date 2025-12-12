# 📚 Hướng Dẫn CI/CD - Bookstore

## Tổng Quan Kiến Trúc

Dự án **Bookstore** đã được deploy với kiến trúc sau:

| Thành Phần | Nền Tảng | URL |
|------------|----------|-----|
| **Frontend** | Vercel | `https://your-frontend.vercel.app` |
| **Backend** | Render | `https://your-backend.onrender.com` |
| **Database** | Neon | PostgreSQL Serverless |

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                         │
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   Frontend  │    │   Backend   │    │  Prisma     │          │
│  │   (React)   │    │  (Express)  │    │  Schema     │          │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘          │
└─────────┼───────────────────┼──────────────────┼─────────────────┘
          │                   │                  │
          │ Auto Deploy       │ Auto Deploy      │ Connected
          ▼                   ▼                  ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │   VERCEL     │   │   RENDER     │   │    NEON      │
   │   ✅ Live    │   │   ✅ Live    │   │   ✅ Live    │
   └──────────────┘   └──────────────┘   └──────────────┘
```

---

## 🔄 Cách Deploy Hoạt Động (Đã Cấu Hình)

### Frontend → Vercel
- **Trigger**: Push code lên `main` branch
- **Auto**: Vercel tự động build & deploy
- **Preview**: Mỗi Pull Request tạo preview URL riêng

### Backend → Render  
- **Trigger**: Push code lên `main` branch
- **Auto**: Render tự động build & deploy
- **Build Command**: `npm install && npm run prebuild && npm run build`
- **Start Command**: `npm run start`

### Database → Neon
- **Serverless**: Không cần deploy, auto-scale
- **Migrations**: Chạy qua `prisma migrate deploy` (trong prebuild của Render)

---

## 🛡️ CI Nhẹ Với GitHub Actions (Khuyên Dùng)

Thêm CI để kiểm tra code quality trước khi merge, **KHÔNG** thay thế auto-deploy.

### Mục Đích
- ✅ Chạy lint & type check trên mỗi Pull Request
- ✅ Block merge nếu code có lỗi
- ✅ Validate Prisma schema khi thay đổi
- ❌ **KHÔNG** deploy (Vercel/Render tự làm)

### File: `.github/workflows/ci.yml`

```yaml
name: CI Checks

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # ========================================
  # Detect what changed
  # ========================================
  changes:
    name: 🔍 Detect Changes
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.filter.outputs.frontend }}
      backend: ${{ steps.filter.outputs.backend }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            frontend:
              - 'frontend/**'
            backend:
              - 'backend/**'

  # ========================================
  # Frontend: Lint & Type Check
  # ========================================
  frontend:
    name: 🎨 Frontend Check
    runs-on: ubuntu-latest
    needs: changes
    if: needs.changes.outputs.frontend == 'true'
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: 🔍 ESLint
        run: npm run lint
        continue-on-error: true

      - name: 🔍 TypeScript Check
        run: npx tsc --noEmit

      - name: 🔨 Build Check
        run: npm run build
        env:
          VITE_API_URL: https://example.com/api
          VITE_GOOGLE_CLIENT_ID: test

  # ========================================
  # Backend: Lint & Type Check
  # ========================================
  backend:
    name: ⚙️ Backend Check
    runs-on: ubuntu-latest
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: 🔍 TypeScript Check
        run: npx tsc --noEmit

      - name: 🔨 Build Check
        run: npm run build
```

---

## 🌿 Git Branching Strategy

```
main ─────────────────────────────────────────────► Production (Auto Deploy)
  │
  └── feature/new-feature ────────────────────────► Development
        │
        └── Pull Request → CI Check → Merge → Auto Deploy
```

### Workflow Đơn Giản

```bash
# 1. Tạo branch mới
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 2. Code và commit
git add .
git commit -m "feat: add new feature"

# 3. Push và tạo Pull Request
git push origin feature/new-feature

# 4. CI chạy tự động, review, merge
# 5. Vercel/Render auto deploy sau khi merge
```

### Conventional Commits

```
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật tài liệu
style: format code
refactor: tái cấu trúc code
chore: công việc maintenance
```

---

## ⚙️ Environment Variables

### Vercel (Frontend)

| Variable | Mô tả |
|----------|-------|
| `VITE_API_URL` | URL backend API |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

### Render (Backend)

| Variable | Mô tả |
|----------|-------|
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | Secret key cho JWT |
| `JWT_EXPIRES_IN` | Token expiration (e.g., `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary config |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |
| `RESEND_API_KEY` | Email service key |
| `GOOGLE_CLIENT_ID` | Google OAuth |
| `FRONTEND_URL` | Frontend URL (CORS) |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

---

## 🔧 Troubleshooting

### Frontend (Vercel)

| Vấn đề | Giải pháp |
|--------|-----------|
| Build failed | Kiểm tra Vercel logs, chạy `npm run build` local |
| API không kết nối | Kiểm tra `VITE_API_URL` trong Vercel settings |

### Backend (Render)

| Vấn đề | Giải pháp |
|--------|-----------|
| Deploy failed | Kiểm tra Render logs |
| Database connection | Kiểm tra `DATABASE_URL`, thêm `?sslmode=require` |
| Cold start chậm | Neon hibernates sau 5 phút idle (free tier) |

### Database (Neon)

| Vấn đề | Giải pháp |
|--------|-----------|
| Connection timeout | Database đang wake up, thử lại |
| Migration failed | Chạy `npx prisma migrate deploy` manual |

---

## 📋 Checklist Deploy Mới

Khi setup project mới hoặc environment mới:

- [ ] Kết nối GitHub repo với Vercel
- [ ] Cấu hình Root Directory: `frontend`
- [ ] Thêm Environment Variables trên Vercel
- [ ] Kết nối GitHub repo với Render
- [ ] Cấu hình Root Directory: `backend`  
- [ ] Thêm Environment Variables trên Render
- [ ] Tạo Neon database và lấy connection string
- [ ] Chạy `prisma migrate deploy` lần đầu

---

*Cập nhật lần cuối: 12/12/2024*
