
### Git Branching Strategy

```
main ─────────────────────────────────────────────► Production
  │
  ├── develop ────────────────────────────────────► Staging
  │     │
  │     ├── feature/add-cart-functionality ───────► Feature
  │     │
  │     ├── feature/user-profile ─────────────────► Feature
  │     │
  │     └── bugfix/fix-payment ───────────────────► Bugfix
  │
  └── hotfix/critical-security-fix ───────────────► Hotfix
```

### Workflow Khi Phát Triển Feature Mới

```bash
# 1. Tạo branch mới từ develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. Code và commit
git add .
git commit -m "feat: add new feature"

# 3. Push và tạo Pull Request
git push origin feature/new-feature

# 4. Sau khi review, merge vào develop
# (Thực hiện trên GitHub)

# 5. Khi sẵn sàng release, merge develop vào main
git checkout main
git pull origin main
git merge develop
git push origin main
```

### Conventional Commits

Sử dụng conventional commits để có changelog tự động:

```
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật tài liệu
style: format code
refactor: tái cấu trúc code
test: thêm test
chore: công việc maintenance
```