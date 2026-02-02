# IT Support Work Log Management System

Hệ thống quản lý nhật ký công việc hỗ trợ IT với đầy đủ tích hợp API backend.

## 🚀 Quick Start

### 1. Cấu hình API URL

Mở `/api/common.ts` và cập nhật `API_BASE_URL`:

```typescript
export const API_BASE_URL = 'https://your-backend-url.com';
```

### 2. Chạy ứng dụng

```bash
npm install
npm start
```

### 3. Đăng nhập

- Sử dụng tài khoản từ database backend
- Nếu backend có bật OTP, nhập mã OTP

## ✨ Features

- ✅ Authentication với JWT + Refresh Token
- ✅ Work Log CRUD đầy đủ
- ✅ Import/Export Excel
- ✅ Knowledge Base suggestions
- ✅ Multiple operators & requesters
- ✅ Dark mode support
- ✅ Responsive design

## 📁 Project Structure

```
/api          - API clients và service layer
/components   - React components
/hooks        - Custom hooks
/types        - TypeScript type definitions
/utils        - Utility functions
/styles       - CSS styles
```

## 🔧 Tech Stack

- React + TypeScript
- Tailwind CSS v4
- Lucide Icons
- ExcelJS (Import/Export)

## 📝 API Documentation

OpenAPI Spec: https://registry.scalar.com/share/apis/XDukqmfm2flvigw3yymKo

## 💡 Support

Email: khangkttb01029@fpt.edu.vn
