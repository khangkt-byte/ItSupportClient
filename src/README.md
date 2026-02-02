# 🛠️ IT Support Work Log Management System

Hệ thống quản lý nhật ký công việc hỗ trợ IT cho phòng IT của công ty địa phương.

## 📋 Mô Tả

Ứng dụng web quản lý nhật ký công việc hỗ trợ IT với đầy đủ tính năng ghi lại chi tiết các báo cáo công việc, quản lý nhân viên, thiết bị, và hỗ trợ import/export Excel.

## ✨ Tính Năng Chính

### 🔐 Hệ Thống Xác Thực
- Đăng nhập với username/email và password
- 2 vai trò: **Admin** và **Employee**
- Token-based authentication (Access Token + Refresh Token)
- Auto-refresh token khi hết hạn

### 📝 Quản Lý Work Logs
- ✅ Tạo, đọc, cập nhật, xóa work logs
- 📅 Ghi lại ngày báo cáo
- 👥 Multi-select Operators (nhân viên IT thực hiện)
- 👤 Multi-select Requesters (người yêu cầu)
- 📄 Mô tả vấn đề, nguyên nhân, giải pháp
- 📝 Ghi chú và trạng thái
- 🔍 Combobox có thể tìm kiếm
- ➕ Cho phép nhập người không có trong danh sách

### 👨‍💼 Quản Lý (Chỉ Admin)
- **Nhân viên**: CRUD employees
- **Thiết bị**: Quản lý thiết bị IT
- **Loại thiết bị**: Phân loại thiết bị
- **Phòng ban**: Quản lý departments
- **Khu vực**: Quản lý areas/locations
- **Tài khoản**: Quản lý user accounts
- **Vai trò**: Quản lý roles và permissions

### 📊 Import/Export Excel
- Import work logs từ Excel
- Export work logs ra Excel
- Validation dữ liệu khi import
- Import wizard với preview

### 🎨 UI/UX
- Responsive design
- Dark mode support (chuẩn bị sẵn)
- Modern UI với Tailwind CSS
- Shadcn/ui components
- Loading states
- Error handling
- Toast notifications

## 🏗️ Công Nghệ Sử Dụng

### Frontend
- **React** 18.x - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Shadcn/ui** - UI components
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Lucide React** - Icons
- **date-fns** - Date formatting

### API Integration
- RESTful API
- Axios for HTTP requests
- Token-based authentication
- Auto-refresh mechanism

## 📁 Cấu Trúc Project

```
/
├── api/                      # API integration
│   ├── common.ts            # API configuration
│   ├── auth.ts              # Authentication API
│   ├── workLogs.ts          # Work logs API
│   ├── employees.ts         # Employees API
│   ├── accounts.ts          # Accounts API
│   ├── roles.ts             # Roles API
│   ├── departments.ts       # Departments API
│   └── areas.ts             # Areas API
│
├── components/              # React components
│   ├── LoginPage.tsx        # Login screen
│   ├── AdminDashboard.tsx   # Admin dashboard
│   ├── EmployeeDashboard.tsx # Employee dashboard
│   ├── WorkLogManagement.tsx # Work logs CRUD
│   ├── EmployeeManagement.tsx
│   ├── AccountManagement.tsx
│   ├── RoleManagement.tsx
│   ├── DepartmentManagement.tsx
│   ├── AreaManagement.tsx
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── FlexibleMultiSelect.tsx
│   ├── AutocompleteInput.tsx
│   ├── ImportWizard.tsx
│   └── ui/                  # Shadcn/ui components
│
├── hooks/                   # Custom React hooks
│   ├── useApi.ts            # API hook with auth
│   ├── useDataManager.ts    # Data CRUD operations
│   ├── useWorkLogs.ts       # Work logs specific
│   ├── usePagination.ts     # Pagination logic
│   └── useDebounce.ts       # Debounce hook
│
├── stores/                  # State management
│   └── dataStore.ts         # Zustand global store
│
├── utils/                   # Utility functions
│   ├── excelUtils.ts        # Excel import/export
│   ├── enhancedExcelUtils.ts
│   └── knowledgeBase.ts     # Issue suggestions
│
├── types/                   # TypeScript types
│   └── data.ts              # Data models
│
├── styles/                  # Global styles
│   └── globals.css          # Tailwind + custom CSS
│
├── App.tsx                  # Main app component
│
└── Documentation/
    ├── API_DOCUMENTATION.md
    ├── UNCOMMENT_INSTRUCTIONS.md
    ├── EXPORT_TO_GITHUB.md
    ├── CHECKLIST.md
    └── COMMENTED_FILES_SUMMARY.md
```

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-username/it-support-worklog-system.git
cd it-support-worklog-system
```

### 2. Install Dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Cấu Hình API

Mở file `/api/common.ts` và cập nhật `API_BASE_URL`:

```typescript
export const API_BASE_URL = 'https://your-backend-api.com';
```

### 4. Gỡ Comment (Nếu Cần)

Xem chi tiết trong [UNCOMMENT_INSTRUCTIONS.md](./UNCOMMENT_INSTRUCTIONS.md)

```bash
# Install toast notification dependencies (optional)
npm install next-themes@0.4.6 sonner@2.0.3
```

### 5. Run Development Server

```bash
npm run dev
# hoặc
yarn dev
```

### 6. Build For Production

```bash
npm run build
# hoặc
yarn build
```

## 🔑 Tài Khoản Mẫu

### Admin
- **Username:** admin
- **Password:** admin123

### Employee
- **Username:** employee
- **Password:** emp123

> ⚠️ **Lưu ý:** Đây là tài khoản mẫu. Trong production, hãy thay đổi password và sử dụng tài khoản thực tế từ backend.

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Chi tiết về API endpoints
- [Uncomment Instructions](./UNCOMMENT_INSTRUCTIONS.md) - Hướng dẫn gỡ comment
- [Export to GitHub](./EXPORT_TO_GITHUB.md) - Hướng dẫn export và deploy
- [Checklist](./CHECKLIST.md) - Checklist setup project
- [Commented Files Summary](./COMMENTED_FILES_SUMMARY.md) - Files đã comment

## 🛠️ Development

### Project Status

- ✅ **Build:** Thành công
- ✅ **Type Safety:** Full TypeScript
- ✅ **Authentication:** Hoàn tất
- ✅ **CRUD Operations:** Hoàn tất
- ✅ **Excel Import/Export:** Hoàn tất
- ✅ **Multi-select:** Hoàn tất
- ✅ **API Integration:** Sẵn sàng (cần backend URL)
- ⚠️ **Toast Notifications:** Đã comment (optional)

### Known Issues

1. **Sonner.tsx commented:** File `/components/ui/sonner.tsx` đã được comment do sử dụng `next-themes` không tương thích với Figma Make. Xem [COMMENTED_FILES_SUMMARY.md](./COMMENTED_FILES_SUMMARY.md) để biết thêm chi tiết.

2. **API URL:** Cần cập nhật `API_BASE_URL` trong `/api/common.ts` trước khi connect với backend thực tế.

### Roadmap

- [ ] Implement real-time notifications
- [ ] Add file attachments to work logs
- [ ] Advanced filtering and search
- [ ] Dashboard analytics và charts
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Audit logs
- [ ] Report generation (PDF)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software for internal company use.

## 👥 Team

- **Project Lead:** [Your Name]
- **Developers:** IT Department
- **Version:** 1.0.0
- **Last Updated:** February 2, 2026

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ:

- **Email:** it-support@company.com
- **Phone:** (+84) XXX-XXX-XXXX
- **Office:** IT Department, Company Name

---

**Made with ❤️ by IT Department**
