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

### Bước 3: Deploy Backend lên Render (10 phút) - MIỄN PHÍ ✨
1. Truy cập https://render.com
2. Đăng nhập bằng GitHub
3. Click "New +" > "Web Service"
4. Chọn repo `bookstore`
5. Cấu hình:
   - **Name**: `bookstore-backend` (hoặc tên bạn thích)
   - **Region**: Singapore (gần VN nhất)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && npm start`
   - **Instance Type**: **Free** (quan trọng!)
6. Scroll xuống "Environment Variables", click "Add Environment Variable" và thêm:
   ```
   DATABASE_URL=<paste từ Neon>
   JWT_SECRET=super-secret-key-at-least-32-characters-long
   NODE_ENV=production
   PORT=10000
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```
7. Click "Create Web Service" và chờ 5-10 phút (lần đầu hơi lâu)
8. Copy URL backend (dạng: `https://bookstore-backend-xxxx.onrender.com`)

> ⚠️ **Lưu ý về Free Tier của Render:**
> - Service sẽ "ngủ" sau 15 phút không hoạt động
> - Lần đầu truy cập sau khi ngủ sẽ mất ~30-50 giây để "wake up"
> - Hoàn toàn miễn phí, không giới hạn thời gian sử dụng

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
1. Quay lại Render Dashboard
2. Chọn service backend vừa tạo
3. Vào tab "Environment"
4. Sửa `CORS_ALLOWED_ORIGINS` thành URL frontend từ bước 4:
   ```
   CORS_ALLOWED_ORIGINS=https://xxx.vercel.app
   ```
5. Click "Save Changes" - service sẽ tự động redeploy

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
- Kiểm tra `CORS_ALLOWED_ORIGINS` trong Render đã đúng chưa
- Đảm bảo không có dấu `/` ở cuối URL
- Service sẽ tự động redeploy sau khi save environment variables

**Backend không start được:**
- Kiểm tra logs trong Render Dashboard (tab "Logs")
- Đảm bảo `DATABASE_URL` format đúng
- Đảm bảo đã chọn **Free** instance type
- Check xem migrations có chạy thành công không

**Backend chậm hoặc timeout lần đầu:**
- Đây là hành vi bình thường của Free tier - service "ngủ" sau 15 phút không dùng
- Chờ 30-50 giây để service "wake up"
- Các lần request tiếp theo sẽ nhanh hơn

**Frontend build failed:**
- Kiểm tra `VITE_API_URL` đã set chưa
- Kiểm tra syntax errors trong code

## 📱 URLs Sau Khi Deploy

Sau khi hoàn thành, bạn sẽ có:

- 🌐 **Frontend**: `https://your-app.vercel.app`
- 🔌 **Backend API**: `https://bookstore-backend-xxxx.onrender.com`
- 🗄️ **Database**: Neon dashboard

## 📚 Tài Liệu Chi Tiết

Xem file [`.agent/workflows/deploy.md`](.agent/workflows/deploy.md) để:
- Hiểu rõ hơn về từng bước
- Xem các options khác (Fly.io, Koyeb, VPS)
- Cấu hình nâng cao
- Tối ưu performance
- Setup monitoring

## 💡 Tips

1. **Free Tier Limits - TẤT CẢ ĐỀU MIỄN PHÍ**: 
   - **Render**: 
     - 750 giờ/tháng (miễn phí vĩnh viễn)
     - Service "ngủ" sau 15 phút không dùng
     - Wake up mất ~30-50 giây
   - **Vercel**: 
     - Unlimited deployments
     - 100GB bandwidth/tháng
   - **Neon**: 
     - 0.5GB storage
     - 1 project miễn phí

2. **Các Nền Tảng Deploy Miễn Phí Khác** (alternatives cho backend):
   - **Fly.io**: 3 VMs miễn phí, region gần VN, hơi phức tạp hơn
   - **Koyeb**: Free tier tốt, tương tự Render
   - **Railway**: Đã thu phí (~$5/tháng) - KHÔNG khuyến khích
   - **Cyclic**: Miễn phí nhưng bị giới hạn nhiều

3. **Auto Deploy**: Mỗi khi push code mới, Render và Vercel sẽ tự động deploy

4. **View Logs**: Có thể xem logs trong dashboard của Render/Vercel

5. **Custom Domain**: Có thể add custom domain sau khi deploy thành công

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
