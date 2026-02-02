# Hướng Dẫn Gỡ Comment Sau Khi Push Lên GitHub

## Các File Đã Được Comment

Để có thể build thành công trong môi trường Figma Make, một số file đã được comment lại do sử dụng packages không tương thích.

### 1. `/components/ui/sonner.tsx`

**Lý do comment:** File này sử dụng `next-themes@0.4.6` - một package của Next.js không tương thích với môi trường React thông thường.

**Nội dung hiện tại (đã comment):**
```tsx
// =====================================================
// TEMPORARILY DISABLED - UNCOMMENT AFTER PUSHING TO GITHUB
// This file uses next-themes which is not compatible
// with standard React environment in Figma Make
// =====================================================
// 
// See UNCOMMENT_INSTRUCTIONS.md for restoration steps
// =====================================================

// Temporary placeholder export to prevent build errors
export const Toaster = () => null;
```

**Cách gỡ comment:**

Thay thế toàn bộ nội dung file `/components/ui/sonner.tsx` bằng code sau:

```tsx
"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
```

## Lưu Ý

- **QUAN TRỌNG:** Chỉ gỡ comment SAU KHI đã push code lên GitHub và pull về môi trường development thực tế (không phải Figma Make)
- Trong môi trường production/development thực tế, bạn cần cài đặt các dependencies cần thiết:
  ```bash
  npm install next-themes@0.4.6 sonner@2.0.3
  ```
- Nếu không sử dụng Next.js, bạn có thể cần thay thế `next-themes` bằng một theme provider khác hoặc tạo custom hook

## Kiểm Tra Sau Khi Gỡ Comment

Sau khi gỡ comment, chạy lệnh sau để đảm bảo không có lỗi build:

```bash
npm run build
# hoặc
yarn build
```

## Cập Nhật API URL

Đừng quên cập nhật `API_BASE_URL` trong file `/api/common.ts` với URL backend thực tế của bạn:

```typescript
// Từ:
export const API_BASE_URL = 'https://localhost:5001';

// Thành:
export const API_BASE_URL = 'https://your-backend-api.com';
```

---

**Ngày tạo:** 2 Tháng 2, 2026
**Môi tr��ờng:** Figma Make → GitHub → Production