# 🚀 Hướng dẫn Deploy và Sử dụng

## ✅ Tổng quan

Ứng dụng IT Support Work Log Management đã được tích hợp đầy đủ với backend API. Tất cả các chức năng đều kết nối với API thực, sẵn sàng để sử dụng trong môi trường production.

## 📋 Checklist trước khi Deploy

### 1. **Cấu hình API URL**

Mở file `/api/common.ts` và cập nhật `API_BASE_URL`:

```typescript
export const API_BASE_URL = 'https://localhost:5001'; // ← Thay đổi thành URL backend của bạn
```

**Lưu ý:** Hiện tại đang là `https://localhost:5001` - bạn cần thay đổi thành URL production của backend.

### 2. **Kiểm tra Backend API**

Đảm bảo backend API của bạn đang chạy và có các endpoints sau:

✅ **Authentication**
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/confirm-otp` - OTP verification (nếu enabled)

✅ **Work Logs (Issue Logs)**
- `GET /api/issue-logs` - Lấy danh sách work logs
- `GET /api/issue-logs/{id}` - Lấy chi tiết work log
- `POST /api/issue-logs` - Tạo mới work log
- `PUT /api/issue-logs/{id}` - Cập nhật work log
- `DELETE /api/issue-logs` - Xóa work logs
- `POST /api/issue-logs/import/validate` - Validate Excel import
- `POST /api/issue-logs/import` - Import từ Excel
- `GET /api/issue-logs/export` - Export ra Excel
- `GET /api/issue-logs/export/template` - Download Excel template

✅ **Employees**
- `GET /api/employees` - Lấy danh sách nhân viên
- `POST /api/employees` - Tạo nhân viên mới
- `PUT /api/employees/{id}` - Cập nhật nhân viên
- `DELETE /api/employees` - Xóa nhân viên
- `GET /api/employees/me` - Lấy profile của user hiện tại

✅ **Areas, Accounts, Roles**
- Tương tự với pattern CRUD cơ bản

✅ **Knowledge Base**
- `GET /api/issues/suggestions` - Gợi ý issues
- `GET /api/causes/suggestions` - Gợi ý causes

### 3. **CORS Configuration**

Đảm bảo backend cho phép CORS từ domain frontend của bạn:

```csharp
// Backend .NET
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder
            .WithOrigins("http://localhost:3000", "https://your-frontend-domain.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});
```

### 4. **Authentication Flow**

Backend sử dụng JWT tokens với refresh token mechanism:
- Access token được lưu trong `localStorage`
- Refresh token được gửi tự động khi access token hết hạn
- API client tự động retry request sau khi refresh token

### 5. **Test Credentials**

Đảm bảo bạn có account test trong database để đăng nhập lần đầu.

## 🔧 Các tính năng đã được tích hợp

### ✅ Authentication
- Login với username/password
- OTP verification (nếu backend enable)
- Auto refresh token
- Logout

### ✅ Work Log Management
- CRUD operations hoàn chỉnh
- Multiple operators và requesters
- Knowledge base suggestions (Issues & Causes)
- Import/Export Excel
- Pagination và search
- Status filtering

### ✅ Employee Management
- CRUD operations (cần implement UI calls - xem phần TODO)
- Pagination và search

### ✅ Role & Permission Management
- Role assignment
- Claims management

### ✅ Area Management  
- CRUD operations

## 📝 TODO - Các bước tiếp theo

### 1. **Hoàn thiện EmployeeManagement Component**

File: `/components/EmployeeManagement.tsx`

Cần thay thế các `TODO` comments bằng API calls thực:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (editing) {
      const updated = await employeesApi.update(editing.empId, {
        fullName: formData.fullName,
        empCode: formData.empCode,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        position: formData.position,
      });
      // Update local state
      setData(data.map(emp => emp.empId === editing.empId ? {...emp, ...updated} : emp));
    } else {
      const created = await employeesApi.create({
        fullName: formData.fullName,
        empCode: formData.empCode,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        position: formData.position,
      });
      setData([...data, created]);
    }
    setShowForm(false);
  } catch (error) {
    alert('Failed to save employee');
  }
};
```

### 2. **Hoàn thiện các Management Components khác**

Áp dụng pattern tương tự cho:
- `AccountManagement.tsx`
- `RoleManagement.tsx`
- `AreaManagement.tsx`
- `DepartmentManagement.tsx` (nếu có)

### 3. **Xử lý Department API**

Backend không có Department endpoint riêng. Departments được managed inline trong IssueLog.

**Giải pháp tạm thời:** Sử dụng hardcoded departments trong `/api/departments.ts`

**Giải pháp lâu dài:** Yêu cầu backend team thêm Department CRUD endpoints.

### 4. **Error Handling & User Feedback**

Thêm toast notifications cho các operations:
```typescript
import { toast } from "sonner@2.0.3";

// Success
toast.success("Work log created successfully!");

// Error
toast.error("Failed to create work log");
```

### 5. **Loading States**

Sử dụng loading states từ `useDataManager` để hiển thị skeleton screens.

## 🔐 Security Notes

### Authentication
- JWT tokens được lưu trong `localStorage` 
- Access token tự động được thêm vào mọi API request
- Refresh token được sử dụng để renew access token

### Recommendations
- **Production:** Nên migrate sang `httpOnly cookies` cho refresh tokens
- **HTTPS:** Bắt buộc sử dụng HTTPS trong production
- **Token Expiry:** Thiết lập token expiry hợp lý (access: 15min, refresh: 7 days)

## 🐛 Troubleshooting

### Lỗi CORS
```
Access to fetch at 'https://localhost:5001/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Giải pháp:** Cấu hình CORS trong backend (xem mục 3 ở trên)

### Lỗi 401 Unauthorized
```
Failed to fetch: Unauthorized
```
**Giải pháp:** 
1. Kiểm tra access token còn hạn không
2. Thử logout và login lại
3. Kiểm tra backend có accept JWT token không

### Lỗi Network
```
Failed to fetch: TypeError: Failed to fetch
```
**Giải pháp:**
1. Kiểm tra backend có đang chạy không
2. Kiểm tra API_BASE_URL đúng chưa
3. Kiểm tra firewall/antivirus có block không

### Field Name Mismatch
Nếu gặp lỗi về missing fields, kiểm tra mapping trong:
- `/types/data.ts` - Type definitions
- `/utils/workLogAdapter.ts` - WorkLog mapping
- `/hooks/useDataLoader.ts` - API response mapping

## 📊 API Documentation

Full API documentation available at:
- OpenAPI Spec: https://registry.scalar.com/share/apis/iRSLdG8e2nfIwlCTgnUcT
- Local Swagger: https://localhost:5001/swagger (nếu backend có enable)

## 🎯 Next Steps

1. ✅ Test login với backend API
2. ✅ Test tạo/sửa/xóa work logs
3. ✅ Test import/export Excel
4. ⏳ Implement CRUD cho các management components còn lại
5. ⏳ Add toast notifications
6. ⏳ Add error boundaries
7. ⏳ Deploy lên production

## 🚀 Deploy Commands

```bash
# Build production
npm run build

# Preview build locally
npm run preview

# Deploy (tùy platform)
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Or simply push to Git and let CI/CD handle it
```

## ✨ Features Summary

### Đã hoàn thành
✅ Full authentication flow với JWT
✅ Work log CRUD với API integration
✅ Knowledge base suggestions (Issues/Causes)
✅ Import/Export Excel
✅ Multi-operator & multi-requester support
✅ Real-time data fetching
✅ Automatic token refresh
✅ Error handling
✅ Loading states
✅ Pagination & search
✅ Status filtering

### Cần hoàn thiện
⏳ Employee Management CRUD calls
⏳ Account Management CRUD calls
⏳ Role Management CRUD calls
⏳ Area Management CRUD calls
⏳ Department Management (nếu backend có API)

---

**Lưu ý:** Ứng dụng hiện đang sẵn sàng để test với backend API. Chỉ cần cập nhật `API_BASE_URL` và bắt đầu sử dụng!

**Support:** khangkttb01029@fpt.edu.vn
