# Hướng Dẫn Export Code Và Push Lên GitHub

## 📋 Tổng Quan

Code hiện tại đã được chuẩn bị để export từ Figma Make và push lên GitHub. Một số file đã được comment tạm thời để tránh lỗi build trong môi trường Figma Make.

## ✅ Trạng Thái Hiện Tại

- ✅ Tất cả build errors đã được fix
- ✅ localStorage token keys đã được thống nhất (accessToken/refreshToken)
- ✅ Missing types đã được thêm (AccountRolesDto, AssignRolesDto)
- ✅ Type mismatches đã được sửa
- ✅ Data transformation đã được thêm vào useDataManager
- ✅ File sonner.tsx đã được comment để tránh lỗi next-themes

## 🚀 Các Bước Export Và Push

### Bước 1: Export Code Từ Figma Make

1. Trong Figma Make, tìm nút **Export** hoặc **Download**
2. Tải toàn bộ project về máy tính
3. Giải nén file (nếu là .zip)

### Bước 2: Tạo GitHub Repository

```bash
# Trên GitHub.com, tạo repository mới
# Ví dụ: it-support-worklog-system

# Clone repository về máy
git clone https://github.com/your-username/it-support-worklog-system.git
cd it-support-worklog-system
```

### Bước 3: Copy Code Vào Repository

```bash
# Copy tất cả files từ thư mục export vào repository
# Đảm bảo copy cả hidden files nếu có
```

### Bước 4: Create .gitignore

Tạo file `.gitignore`:

```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db
```

### Bước 5: Initialize Project (Nếu Cần)

Nếu chưa có package.json, tạo file với nội dung cơ bản:

```json
{
  "name": "it-support-worklog-system",
  "version": "1.0.0",
  "private": true,
  "description": "IT Support Work Log Management System",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.30.0",
    "zustand": "^4.4.1",
    "react-hook-form": "^7.55.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

### Bước 6: Commit Và Push

```bash
# Add tất cả files
git add .

# Commit với message mô tả
git commit -m "Initial commit: IT Support Work Log Management System

- Implemented authentication (admin/employee roles)
- Created work log management with CRUD operations
- Added employee, department, area, role, account management
- Implemented Excel import/export functionality
- Added multi-select for operators and requesters
- Fixed all build errors and type issues
- Commented out sonner.tsx for Figma Make compatibility"

# Push lên GitHub
git push origin main
# hoặc
git push origin master
```

### Bước 7: Clone Về Môi Trường Development

```bash
# Trên máy development
git clone https://github.com/your-username/it-support-worklog-system.git
cd it-support-worklog-system

# Install dependencies
npm install
# hoặc
yarn install
```

### Bước 8: Gỡ Comment

Sau khi clone về, làm theo hướng dẫn trong file `UNCOMMENT_INSTRUCTIONS.md`:

1. Mở `/components/ui/sonner.tsx`
2. Gỡ comment block
3. Cài đặt dependencies cần thiết:
   ```bash
   npm install next-themes@0.4.6 sonner@2.0.3
   ```

### Bước 9: Cập Nhật API URL

Mở file `/api/common.ts` và cập nhật:

```typescript
export const API_BASE_URL = 'https://your-backend-api.com';
```

### Bước 10: Test Build

```bash
npm run build
# hoặc
yarn build
```

Nếu build thành công, bạn đã hoàn tất!

## 📝 Commit Changes Sau Khi Gỡ Comment

```bash
git add .
git commit -m "Uncommented sonner.tsx and updated API URL for production"
git push origin main
```

## 🔧 Setup CI/CD (Optional)

Bạn có thể setup GitHub Actions để tự động build và deploy. Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      # Add your deployment steps here
      run: echo "Deploy to your hosting"
```

## 📚 Tài Liệu Tham Khảo

- [API Documentation](./API_DOCUMENTATION.md) - Hướng dẫn sử dụng API
- [Uncomment Instructions](./UNCOMMENT_INSTRUCTIONS.md) - Hướng dẫn gỡ comment
- [Guidelines](./guidelines/Guidelines.md) - Nguyên tắc phát triển

## 🆘 Troubleshooting

### Lỗi: Module not found

```bash
npm install
# hoặc
yarn install
```

### Lỗi: TypeScript compilation errors

Đảm bảo đã gỡ comment các file cần thiết theo hướng dẫn trong `UNCOMMENT_INSTRUCTIONS.md`

### Lỗi: API connection failed

Kiểm tra `API_BASE_URL` trong `/api/common.ts` đã được cập nhật chưa

---

**Chúc bạn thành công! 🎉**
