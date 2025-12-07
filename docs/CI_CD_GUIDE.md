# 🚀 CI/CD Guide - Bookstore Project

## Hướng dẫn CI/CD với GitHub Actions cho người mới bắt đầu

---

## 📚 Mục lục

1. [CI/CD là gì?](#cicd-là-gì)
2. [Kiến trúc Deploy hiện tại](#kiến-trúc-deploy-hiện-tại)
3. [GitHub Actions cơ bản](#github-actions-cơ-bản)
4. [Thiết lập CI/CD cho Frontend (Vercel)](#thiết-lập-cicd-cho-frontend-vercel)
5. [Thiết lập CI/CD cho Backend (Render)](#thiết-lập-cicd-cho-backend-render)
6. [Workflow hoàn chỉnh](#workflow-hoàn-chỉnh)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 CI/CD là gì?

### CI - Continuous Integration (Tích hợp liên tục)
- **Tự động hóa** việc kiểm tra code mỗi khi push lên GitHub
- Chạy **tests**, **linting**, **type checking**
- Phát hiện lỗi **sớm** trước khi merge

### CD - Continuous Deployment (Triển khai liên tục)
- **Tự động deploy** khi code được merge vào branch chính
- Không cần deploy thủ công
- Đảm bảo **production luôn cập nhật**

### Luồng hoạt động

```
Developer → Push Code → GitHub
                          ↓
                    GitHub Actions
                          ↓
              ┌──────────┴──────────┐
              ↓                     ↓
         Run Tests              Build App
              ↓                     ↓
         Pass? ────No────→ ❌ Notify Developer
              │
             Yes
              ↓
         Deploy to Production
              ↓
         ✅ Live on Vercel/Render
```

---

## 🏗️ Kiến trúc Deploy hiện tại

```
┌─────────────────────────────────────────────────────────────┐
│                        GITHUB REPOSITORY                      │
│                    github.com/your-username/bookstore         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Push/Merge
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Lint      │→ │   Test      │→ │  Build & Deploy     │  │
│  │   Check     │  │   (future)  │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────┐               ┌─────────────────────┐
│      VERCEL         │               │      RENDER         │
│   (Frontend)        │               │   (Backend)         │
│                     │               │                     │
│  - React + Vite     │               │  - Express + Prisma │
│  - Static hosting   │               │  - PostgreSQL       │
│  - Auto SSL         │               │  - Auto scaling     │
│  - CDN              │               │                     │
│                     │    API Call   │                     │
│  bookstore.vercel   │◄─────────────►│  api.render.com     │
│     .app            │               │                     │
└─────────────────────┘               └─────────────────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │   DATABASE      │
                                      │  (PostgreSQL)   │
                                      │  Neon/Supabase  │
                                      └─────────────────┘
```

---

## ⚙️ GitHub Actions cơ bản

### Cấu trúc thư mục
```
bookstore/
├── .github/
│   └── workflows/
│       ├── ci.yml           # Chạy tests & linting
│       ├── frontend.yml     # Deploy frontend
│       └── backend.yml      # Deploy backend
├── frontend/
└── backend/
```

### Cấu trúc file workflow (.yml)

```yaml
name: Workflow Name           # Tên hiển thị

on:                           # Khi nào chạy?
  push:
    branches: [main]          # Push vào main
  pull_request:
    branches: [main]          # PR vào main

jobs:
  job-name:                   # Tên job
    runs-on: ubuntu-latest    # Môi trường
    
    steps:                    # Các bước thực hiện
      - name: Step 1
        uses: actions/checkout@v4   # Dùng action có sẵn
        
      - name: Step 2
        run: npm install            # Chạy command
```

### Các khái niệm quan trọng

| Khái niệm | Giải thích |
|-----------|------------|
| **Workflow** | File .yml định nghĩa pipeline |
| **Event** | Sự kiện trigger (push, PR, schedule) |
| **Job** | Nhóm các bước chạy trên 1 runner |
| **Step** | Hành động đơn lẻ trong job |
| **Action** | Script tái sử dụng (actions/checkout) |
| **Runner** | Máy ảo chạy workflow |
| **Secrets** | Biến môi trường bí mật |

---

## 🌐 Thiết lập CI/CD cho Frontend (Vercel)

### Cách 1: Vercel Auto-Deploy (Đơn giản nhất)

Vercel **tự động** deploy khi push lên GitHub. Bạn chỉ cần:

1. **Connect GitHub repo với Vercel:**
   - Vercel Dashboard → Add New Project
   - Import từ GitHub
   - Chọn thư mục `frontend`
   - Deploy!

2. **Cấu hình trong Vercel Dashboard:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`

### Cách 2: GitHub Actions + Vercel CLI (Kiểm soát nhiều hơn)

Tạo file `.github/workflows/frontend.yml`:

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'      # Chỉ chạy khi frontend thay đổi
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  # ============================================
  # JOB 1: LINT & TYPE CHECK
  # ============================================
  lint:
    name: 🔍 Lint & Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: 📥 Install dependencies
        run: npm ci
      
      - name: 🔍 Run ESLint
        run: npm run lint
      
      - name: 🔍 TypeScript Check
        run: npx tsc --noEmit

  # ============================================
  # JOB 2: BUILD
  # ============================================
  build:
    name: 🏗️ Build
    runs-on: ubuntu-latest
    needs: lint              # Chạy sau lint thành công
    defaults:
      run:
        working-directory: frontend
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: 📥 Install dependencies
        run: npm ci
      
      - name: 🏗️ Build application
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
      
      - name: 📤 Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: frontend/dist

  # ============================================
  # JOB 3: DEPLOY TO VERCEL
  # ============================================
  deploy:
    name: 🚀 Deploy to Vercel
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'   # Chỉ deploy khi merge vào main
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: 📥 Install Vercel CLI
        run: npm install -g vercel@latest
      
      - name: 🔗 Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: frontend
      
      - name: 🏗️ Build with Vercel
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: frontend
      
      - name: 🚀 Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: frontend
```

### Lấy Vercel Secrets

1. **VERCEL_TOKEN:**
   - Vercel Dashboard → Settings → Tokens → Create

2. **VERCEL_ORG_ID & VERCEL_PROJECT_ID:**
   ```bash
   cd frontend
   vercel link    # Sẽ tạo file .vercel/project.json
   cat .vercel/project.json
   # {"orgId": "xxx", "projectId": "yyy"}
   ```

3. **Thêm vào GitHub Secrets:**
   - GitHub Repo → Settings → Secrets and variables → Actions
   - Add: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## 🖥️ Thiết lập CI/CD cho Backend (Render)

### Cách 1: Render Auto-Deploy (Đơn giản nhất)

1. **Connect GitHub với Render:**
   - Render Dashboard → New → Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   
2. **Build & Start Commands:**
   ```
   Build: npm install && npm run build
   Start: npm run start
   ```

3. **Environment Variables trong Render:**
   ```
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...
   JWT_SECRET=your-secret
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

### Cách 2: GitHub Actions + Render Deploy Hook

Tạo file `.github/workflows/backend.yml`:

```yaml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  # ============================================
  # JOB 1: LINT & TYPE CHECK
  # ============================================
  lint:
    name: 🔍 Lint & Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: 📥 Install dependencies
        run: npm ci
      
      - name: 📥 Generate Prisma Client
        run: npx prisma generate
      
      - name: 🔍 TypeScript Check
        run: npx tsc --noEmit

  # ============================================
  # JOB 2: BUILD
  # ============================================
  build:
    name: 🏗️ Build
    runs-on: ubuntu-latest
    needs: lint
    defaults:
      run:
        working-directory: backend
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: 📥 Install dependencies
        run: npm ci
      
      - name: 📥 Generate Prisma Client
        run: npx prisma generate
      
      - name: 🏗️ Build application
        run: npm run build

  # ============================================
  # JOB 3: DEPLOY TO RENDER
  # ============================================
  deploy:
    name: 🚀 Deploy to Render
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: 🚀 Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Lấy Render Deploy Hook

1. Render Dashboard → Your Service → Settings
2. Scroll xuống "Deploy Hook"
3. Copy URL
4. Thêm vào GitHub Secrets: `RENDER_DEPLOY_HOOK`

---

## 📋 Workflow hoàn chỉnh

Tạo file `.github/workflows/ci.yml` cho kiểm tra tổng thể:

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ============================================
  # FRONTEND CHECKS
  # ============================================
  frontend:
    name: 🌐 Frontend
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type Check
        run: npx tsc --noEmit
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: https://api.example.com

  # ============================================
  # BACKEND CHECKS
  # ============================================
  backend:
    name: 🖥️ Backend
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install
        run: npm ci
      
      - name: Generate Prisma
        run: npx prisma generate
      
      - name: Type Check
        run: npx tsc --noEmit
      
      - name: Build
        run: npm run build

  # ============================================
  # FINAL STATUS CHECK
  # ============================================
  ci-success:
    name: ✅ CI Success
    runs-on: ubuntu-latest
    needs: [frontend, backend]
    steps:
      - name: All checks passed
        run: echo "🎉 All CI checks passed!"
```

---

## 🛠️ Thiết lập GitHub Secrets

Vào GitHub Repo → Settings → Secrets and variables → Actions

### Frontend Secrets
| Secret Name | Mô tả | Ví dụ |
|-------------|-------|-------|
| `VERCEL_TOKEN` | Token API từ Vercel | `xxx` |
| `VERCEL_ORG_ID` | Org ID từ .vercel/project.json | `team_xxx` |
| `VERCEL_PROJECT_ID` | Project ID | `prj_xxx` |
| `VITE_API_URL` | URL backend API | `https://api.render.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` |

### Backend Secrets
| Secret Name | Mô tả | Ví dụ |
|-------------|-------|-------|
| `RENDER_DEPLOY_HOOK` | Webhook URL từ Render | `https://api.render.com/deploy/xxx` |
| `DATABASE_URL` | PostgreSQL connection string (nếu cần) | `postgresql://...` |

---

## 📊 Best Practices

### 1. Branch Protection Rules
```
GitHub → Settings → Branches → Add rule → main

✅ Require a pull request before merging
✅ Require status checks to pass before merging
   - Select: CI Pipeline / frontend
   - Select: CI Pipeline / backend
✅ Require branches to be up to date before merging
```

### 2. Commit Message Convention
```bash
# Format
<type>(<scope>): <description>

# Examples
feat(auth): add Google OAuth login
fix(cart): resolve quantity update bug
docs(readme): update installation guide
chore(deps): update React to v18.2.1
```

### 3. Git Flow
```
main          ●────●────●────●────●  (Production)
              ▲         ▲
develop      ●────●────●────●────●  (Staging)
              ▲    ▲
feature/*    ●────●    ●────●       (Feature branches)
```

### 4. Environment Strategy
```
┌─────────────┬───────────────┬──────────────────┐
│ Branch      │ Environment   │ Deploy Target    │
├─────────────┼───────────────┼──────────────────┤
│ main        │ Production    │ vercel.app       │
│ develop     │ Staging       │ preview.vercel   │
│ feature/*   │ Preview       │ PR Preview       │
└─────────────┴───────────────┴──────────────────┘
```

---

## 🔧 Troubleshooting

### Lỗi thường gặp

#### 1. "npm ci" failed
```yaml
# Ensure package-lock.json exists and is committed
steps:
  - run: npm ci
    # NOT: npm install
```

#### 2. Prisma Generate fails
```yaml
# Generate Prisma client before other steps
- run: npx prisma generate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

#### 3. Build fails on type errors
```yaml
# Check locally first
- run: npx tsc --noEmit
```

#### 4. CORS issues after deploy
```bash
# Backend .env
CORS_ORIGIN=https://your-frontend.vercel.app

# Không dùng trailing slash!
# ❌ https://your-frontend.vercel.app/
# ✅ https://your-frontend.vercel.app
```

#### 5. Database migrations not running
```yaml
# Add to Render build command
npm install && npx prisma migrate deploy && npm run build
```

### Debug Workflow

```yaml
# Thêm step debug
- name: Debug
  run: |
    echo "Current directory: $(pwd)"
    echo "Files: $(ls -la)"
    echo "Node version: $(node -v)"
    echo "NPM version: $(npm -v)"
```

---

## 📚 Tài liệu tham khảo

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

---

## 🎉 Kết luận

Sau khi setup xong, quy trình làm việc của bạn sẽ là:

1. **Code** trên branch feature
2. **Push** lên GitHub
3. **Create PR** vào main
4. **GitHub Actions** tự động kiểm tra
5. **Review & Merge** PR
6. **Auto Deploy** lên Vercel & Render


*Created for Bookstore Project - December 2024*
