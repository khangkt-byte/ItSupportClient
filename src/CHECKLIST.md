# ✅ Checklist: Push Code Lên GitHub

## 📦 Trước Khi Export Từ Figma Make

- [x] Fix tất cả build errors
- [x] Thống nhất localStorage token keys
- [x] Thêm missing types
- [x] Sửa type mismatches
- [x] Comment file sonner.tsx (do next-themes incompatibility)
- [x] Tạo UNCOMMENT_INSTRUCTIONS.md
- [x] Tạo EXPORT_TO_GITHUB.md
- [x] Tạo CHECKLIST.md

## 🚀 Export Và Setup GitHub

- [ ] Export code từ Figma Make
- [ ] Tạo GitHub repository mới
- [ ] Clone repository về máy local
- [ ] Copy code vào repository
- [ ] Tạo file .gitignore
- [ ] Review lại code

## 📝 Git Operations

- [ ] `git add .`
- [ ] `git commit -m "Initial commit: IT Support Work Log Management System"`
- [ ] `git push origin main` (hoặc master)
- [ ] Verify code đã lên GitHub thành công

## 💻 Clone Về Development Environment

- [ ] Clone repository về máy development
- [ ] Run `npm install` hoặc `yarn install`

## 🔓 Gỡ Comment

### File: `/components/ui/sonner.tsx`

- [ ] Mở file `/components/ui/sonner.tsx`
- [ ] Xóa comment header (dòng 1-6)
- [ ] Bỏ comment block `/* ... */`
- [ ] Xóa placeholder export `export const Toaster = () => null;`
- [ ] Hoặc thay thế toàn bộ bằng code gốc trong UNCOMMENT_INSTRUCTIONS.md

## 📦 Install Dependencies Bổ Sung

- [ ] `npm install next-themes@0.4.6 sonner@2.0.3`

## ⚙️ Cấu Hình Production

### File: `/api/common.ts`

- [ ] Mở file `/api/common.ts`
- [ ] Thay đổi `API_BASE_URL` từ `https://localhost:5001`
- [ ] Thành URL backend thực tế của bạn

## 🧪 Testing

- [ ] Run `npm run build` để kiểm tra build
- [ ] Fix bất kỳ errors nếu có
- [ ] Test chức năng login
- [ ] Test CRUD operations cho work logs
- [ ] Test Excel import/export
- [ ] Test permissions (admin vs employee)

## 🎯 Final Steps

- [ ] Commit changes sau khi gỡ comment:
  ```bash
  git add .
  git commit -m "Uncommented sonner.tsx and updated API URL"
  git push origin main
  ```

## 📋 Danh Sách Files Quan Trọng

### Core Files
- [x] `/App.tsx` - Main application component
- [x] `/api/common.ts` - API configuration (CẦN CẬP NHẬT API_BASE_URL)
- [x] `/api/auth.ts` - Authentication API
- [x] `/api/workLogs.ts` - Work logs API

### Components
- [x] `/components/LoginPage.tsx`
- [x] `/components/AdminDashboard.tsx`
- [x] `/components/EmployeeDashboard.tsx`
- [x] `/components/WorkLogManagement.tsx`
- [x] `/components/EmployeeManagement.tsx`
- [x] `/components/AccountManagement.tsx`
- [x] `/components/RoleManagement.tsx`
- [x] `/components/DepartmentManagement.tsx`
- [x] `/components/AreaManagement.tsx`

### Utilities
- [x] `/utils/excelUtils.ts` - Excel import/export
- [x] `/hooks/useDataManager.ts` - Data management hook
- [x] `/stores/dataStore.ts` - Zustand store

### Documentation
- [x] `/API_DOCUMENTATION.md`
- [x] `/UNCOMMENT_INSTRUCTIONS.md`
- [x] `/EXPORT_TO_GITHUB.md`
- [x] `/CHECKLIST.md`

## ⚠️ Lưu Ý Quan Trọng

1. **KHÔNG GỠ COMMENT** khi còn trong môi trường Figma Make
2. **CHỈ GỠ COMMENT** sau khi đã push lên GitHub và clone về môi trường development thực tế
3. **PHẢI CẬP NHẬT** `API_BASE_URL` trong `/api/common.ts` trước khi deploy production
4. **NÊN TEST KỸ** tất cả chức năng sau khi gỡ comment

## 🎉 Hoàn Thành

Khi đã check hết tất cả items trong checklist:

- [ ] Code đã lên GitHub thành công
- [ ] Đã gỡ comment và cập nhật API URL
- [ ] Build thành công không có errors
- [ ] Tất cả chức năng hoạt động bình thường
- [ ] Documentation đầy đủ và rõ ràng

**XIN CHÚC MỪNG! Bạn đã sẵn sàng để phát triển và deploy ứng dụng! 🎊**

---

**Ngày tạo:** 2 Tháng 2, 2026  
**Phiên bản:** 1.0.0  
**Tác giả:** IT Support Work Log Management System Team
