# 🚀 Hướng Dẫn Deploy Nhanh

## ✅ Checklist Chuẩn Bị

Trước khi deploy, hãy đảm bảo bạn đã:

- [ ] Code đang chạy tốt ở local (cả frontend và backend)
- [ ] Đã test các chức năng chính
- [ ] Có tài khoản GitHub
- [ ] Đã đọc file `.agent/workflows/deploy.md` để hiểu chi tiết

## 📋 Các Bước Deploy (Tóm Tắt)

### Bước 1: Chuẩn Bị Database (5 phút)
1. Truy cập https://neon.tech
2. Tạo account và tạo project mới
3. Copy **Connection String** (DATABASE_URL)
4. Lưu lại để dùng ở bước 3

### Bước 2: Push Code Lên GitHub (5 phút)
```bash
cd c:\Users\Khoa\Desktop\bookstore
git init
git add .
git commit -m "Initial commit - ready for deployment"

# Tạo repo mới trên GitHub trước, sau đó:
git remote add origin https://github.com/YOUR_USERNAME/bookstore.git
git branch -M main
git push -u origin main
```

### Bước 3: Deploy Backend lên Railway (10 phút)
1. Truy cập https://railway.app
2. Đăng nhập bằng GitHub
3. Click "New Project" > "Deploy from GitHub repo"
4. Chọn repo `bookstore`
5. Vào Settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build && npx prisma generate`
   - Start Command: `npx prisma migrate deploy && npm start`
6. Vào Variables tab, thêm:
   ```
   DATABASE_URL=<paste từ Neon>
   JWT_SECRET=super-secret-key-at-least-32-characters-long
   NODE_ENV=production
   PORT=3000
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```
7. Deploy và chờ 3-5 phút
8. Copy URL backend (dạng: `https://xxx.up.railway.app`)

### Bước 4: Deploy Frontend lên Vercel (5 phút)
1. Truy cập https://vercel.com
2. Đăng nhập bằng GitHub
3. Click "Add New" > "Project"
4. Import repo `bookstore`
5. Cấu hình:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Environment Variables:
   ```
   VITE_API_URL=<paste URL backend từ bước 3>/api
   ```
7. Deploy và chờ 2-3 phút
8. Copy URL frontend (dạng: `https://xxx.vercel.app`)

### Bước 5: Cập Nhật CORS (2 phút)
1. Quay lại Railway
2. Vào Variables tab
3. Sửa `CORS_ALLOWED_ORIGINS` thành URL frontend từ bước 4:
   ```
   CORS_ALLOWED_ORIGINS=https://xxx.vercel.app
   ```
4. Redeploy

### Bước 6: Test (5 phút)
1. Mở URL frontend
2. Thử các tính năng:
   - [ ] Đăng ký tài khoản
   - [ ] Đăng nhập
   - [ ] Xem danh sách sách
   - [ ] Thêm vào giỏ hàng
   - [ ] Tạo đơn hàng (nếu có data)

## 🆘 Troubleshooting

### Lỗi thường gặp:

**"CORS Error" khi gọi API từ frontend:**
- Kiểm tra `CORS_ALLOWED_ORIGINS` trong Railway đã đúng chưa
- Đảm bảo không có dấu `/` ở cuối URL
- Redeploy backend sau khi sửa

**Backend không start được:**
- Kiểm tra logs trong Railway
- Đảm bảo `DATABASE_URL` format đúng
- Đảm bảo đã run migrations

**Frontend build failed:**
- Kiểm tra `VITE_API_URL` đã set chưa
- Kiểm tra syntax errors trong code

## 📱 URLs Sau Khi Deploy

Sau khi hoàn thành, bạn sẽ có:

- 🌐 **Frontend**: `https://your-app.vercel.app`
- 🔌 **Backend API**: `https://your-api.railway.app`
- 🗄️ **Database**: Neon dashboard

## 📚 Tài Liệu Chi Tiết

Xem file [`.agent/workflows/deploy.md`](.agent/workflows/deploy.md) để:
- Hiểu rõ hơn về từng bước
- Xem các options khác (Render, Netlify, VPS)
- Cấu hình nâng cao
- Tối ưu performance
- Setup monitoring

## 💡 Tips

1. **Free Tier Limits**: 
   - Railway: $5 credit/month (đủ cho demo)
   - Vercel: Unlimited deployments
   - Neon: 0.5GB storage

2. **Auto Deploy**: Mỗi khi push code mới, Railway và Vercel sẽ tự động deploy

3. **View Logs**: Có thể xem logs trong dashboard của Railway/Vercel

4. **Custom Domain**: Có thể add custom domain sau khi deploy thành công

## 🎯 Next Steps

Sau khi deploy thành công:
- [ ] Setup Cloudinary cho image uploads
- [ ] Add monitoring với Sentry
- [ ] Setup custom domain
- [ ] Add Google Analytics
- [ ] Seed database với data thật

---

**Chúc bạn deploy thành công! 🎉**

Nếu gặp vấn đề, hãy check logs hoặc tham khảo file `deploy.md` chi tiết hơn.
