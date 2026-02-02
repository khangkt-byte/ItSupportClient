# ⚡ Quick Start Guide

**Thời gian đọc: 2 phút** | **Thực hiện: 10 phút**

---

## 🎯 Bạn Đang Ở Đây

✅ Code đã build thành công trong Figma Make  
✅ Sẵn sàng push lên GitHub  
✅ 1 file đã được comment (không ảnh hưởng chức năng)

---

## 🚀 3 Bước Đơn Giản

### 1️⃣ Export & Push (5 phút)

```bash
# Tại GitHub.com
Tạo repository mới → "it-support-worklog-system"

# Tại máy local
git clone https://github.com/USERNAME/it-support-worklog-system.git
cd it-support-worklog-system

# Copy code từ Figma Make export vào folder này

# Push lên GitHub
git add .
git commit -m "Initial commit: IT Support Work Log System"
git push origin main
```

### 2️⃣ Setup Project (3 phút)

```bash
# Clone về (nếu chưa có)
git clone https://github.com/USERNAME/it-support-worklog-system.git
cd it-support-worklog-system

# Install dependencies
npm install

# Copy .gitignore
mv SAMPLE.gitignore .gitignore
```

### 3️⃣ Configure & Run (2 phút)

**Mở `/api/common.ts`:**
```typescript
// Thay đổi dòng này:
export const API_BASE_URL = 'https://localhost:5001';

// Thành URL backend của bạn:
export const API_BASE_URL = 'https://your-api.com';
```

**Run:**
```bash
npm run dev
```

**Xong! 🎉** Mở trình duyệt tại `http://localhost:5173`

---

## 📋 File Đã Comment

**File:** `/components/ui/sonner.tsx`  
**Lý do:** Sử dụng `next-themes` (Next.js only)  
**Ảnh hưởng:** ❌ KHÔNG (file không được dùng)  
**Cần gỡ ngay:** ❌ KHÔNG (optional)

👉 Chi tiết: Xem [UNCOMMENT_INSTRUCTIONS.md](./UNCOMMENT_INSTRUCTIONS.md)

---

## ✅ Checklist Nhanh

```
□ Export code từ Figma Make
□ Tạo GitHub repository
□ Push code lên GitHub
□ Clone về máy local
□ npm install
□ Đổi tên SAMPLE.gitignore → .gitignore
□ Cập nhật API_BASE_URL trong /api/common.ts
□ npm run dev
□ Test login
□ Hoàn tất! ✨
```

---

## 🆘 Troubleshooting

**Q: npm install lỗi?**  
A: Đảm bảo đã cài Node.js >= 18

**Q: Build lỗi?**  
A: Chạy `npm install` lại

**Q: API không connect được?**  
A: Kiểm tra `API_BASE_URL` trong `/api/common.ts`

**Q: Cần gỡ comment ngay không?**  
A: KHÔNG. File sonner.tsx không ảnh hưởng chức năng

---

## 📚 Tài Liệu Đầy Đủ

| File | Mục đích |
|------|----------|
| [README.md](./README.md) | Tổng quan project |
| [BUILD_STATUS.md](./BUILD_STATUS.md) | Chi tiết build status |
| [EXPORT_TO_GITHUB.md](./EXPORT_TO_GITHUB.md) | Hướng dẫn chi tiết export |
| [CHECKLIST.md](./CHECKLIST.md) | Checklist đầy đủ |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | API documentation |

---

## 🎯 Default Login

**Admin:**
- Username: `admin`
- Password: `admin123`

**Employee:**
- Username: `employee`
- Password: `emp123`

> ⚠️ Đổi password trong production!

---

## 💡 Tips

✅ **CÓ THỂ** push ngay lên GitHub  
✅ **KHÔNG CẦN** gỡ comment trước  
✅ **CHỈ CẦN** đổi API_BASE_URL  
✅ **SẴN SÀNG** dùng luôn sau khi npm install

---

**🚀 Bắt đầu thôi!**

Có câu hỏi? Xem [EXPORT_TO_GITHUB.md](./EXPORT_TO_GITHUB.md) để biết chi tiết.
