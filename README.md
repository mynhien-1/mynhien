# TÀI NGUYÊN KHỐI HAI (Kho Liên Kết Thông Minh)

Ứng dụng web hiện đại, trực quan và chuyên nghiệp dành cho **Giáo viên Tiểu học (Khối 2)** để lưu trữ, phân loại, tìm kiếm và chia sẻ các liên kết tài nguyên dạy học (website, bài giảng, trò chơi tương tác, công cụ AI, tài liệu tham khảo...).

---

## 🌟 TÍNH NĂNG CHÍNH

1. **Quản lý liên kết (CRUD)**:
   - Thêm, sửa, xóa, gắn nhãn danh mục, thêm từ khóa (tags).
   - Tự động lấy Favicon đại diện từ tên miền website.
   - Thùng rác (Trash) với chức năng khôi phục hoặc xóa vĩnh viễn.

2. **Tìm kiếm & Phân loại thông minh**:
   - Tìm kiếm tức thời theo tên, URL, mô tả, từ khóa và danh mục.
   - Bộ lọc nhanh: Tất cả, Yêu thích (★), Đã ghim (📌), Danh mục môn học.
   - Sắp xếp đa dạng: Mới nhất, Cũ nhất, Tên A → Z, Tên Z → A, Hay dùng nhất.
   - Chế độ xem linh hoạt: Dạng Lưới (Grid) và Dạng Danh sách (List).

3. **Chia sẻ & Tương tác**:
   - **Chia sẻ từng liên kết**: Web Share API, sao chép URL, sao chép trích dẫn văn bản, chia sẻ mã QR trực quan.
   - **Chia sẻ toàn bộ kho**: Xuất báo cáo Markdown/HTML/Văn bản đẹp mắt để gửi qua Zalo, Facebook, Email hoặc in tài liệu.

4. **Sao lưu & Đồng bộ**:
   - Lưu trữ tức thì trên trình duyệt (`LocalStorage`) không phụ thuộc server.
   - Xuất / Nhập tệp sao lưu `.JSON` an toàn.
   - Hỗ trợ đồng bộ đám mây với **Firebase Firestore & Google Authentication**.

5. **Giao diện & Trải nghiệm**:
   - Thiết kế chuẩn sư phạm: Màu sắc trang nhã, typography rõ ràng, hiệu ứng chuyển động mượt mà.
   - Hỗ trợ chế độ Sáng (Light) / Tối (Dark) / Theo hệ thống (System).
   - Tối ưu 100% trên cả máy tính bàn, laptop trường, máy tính bảng và điện thoại.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN CỤC BỘ

### Yêu cầu môi trường
- **Node.js**: Phiên bản 18 trở lên.
- **npm** hoặc **yarn** / **pnpm**.

### Các bước thực hiện:
```bash
# 1. Clone mã nguồn hoặc tải mã nguồn về máy
git clone https://github.com/your-username/tai-nguyen-khoi-hai.git
cd tai-nguyen-khoi-hai

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev

# 4. Đóng gói cho môi trường thực tế (Production Build)
npm run build
```

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI (DEPLOY) LÊN VERCEL

Ứng dụng được cấu hình chuẩn Single Page Application (Vite + React 19) và đã tích hợp sẵn tệp `vercel.json`.

### Cách 1: Triển khai 1-click qua GitHub & Vercel Dashboard (Khuyên dùng)
1. Đẩy toàn bộ mã nguồn lên một kho lưu trữ GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "Kho tai nguyen khoi 2"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tai-nguyen-khoi-hai.git
   git push -u origin main
   ```
2. Truy cập [vercel.com/new](https://vercel.com/new) và đăng nhập bằng tài khoản GitHub.
3. Chọn Repository vừa tải lên và nhấn **Import**.
4. Cấu hình tự động nhận diện:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. (Tùy chọn) Thêm các biến môi trường Firebase tại mục **Environment Variables** (xem mục bên dưới).
6. Nhấn **Deploy** và nhận ngay địa chỉ web miễn phí dạng `https://your-project.vercel.app`.

---

## 🔒 HƯỚNG DẪN CẤU HÌNH BIẾN MÔI TRƯỜNG & FIREBASE

Nếu muốn kích hoạt tính năng **Đăng nhập Google** và **Đồng bộ kho liên kết lên đám mây**, bạn có thể tạo dự án Firebase miễn phí:

### 1. Tạo dự án Firebase
1. Truy cập [Firebase Console](https://console.firebase.google.com/) và nhấn **Add project**.
2. Đặt tên dự án (ví dụ: `tai-nguyen-khoi-hai`).
3. Chọn tạo **Web App** (biểu tượng `</>`) để lấy các thông số API.
4. Bật **Authentication**: Chọn **Sign-in method** > Chọn **Google** > Bật **Enable**. Tại mục *Authorized domains*, thêm tên miền của bạn trên Vercel (ví dụ: `your-project.vercel.app`).
5. Bật **Cloud Firestore Database** (chế độ Production).

### 2. Cấu hình Firestore Security Rules
Vào tab **Rules** trong Firestore Database và dán cấu hình sau:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép người dùng đọc và ghi vào kho tài nguyên riêng của họ
    match /teacher_vaults/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Cho phép chia sẻ công khai khi có flag public
    match /public_vaults/{shareId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Thiết lập biến môi trường
Tạo tệp `.env` tại thư mục gốc (hoặc nhập vào mục **Environment Variables** trên Vercel):
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="tai-nguyen-khoi-hai.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tai-nguyen-khoi-hai"
VITE_FIREBASE_STORAGE_BUCKET="tai-nguyen-khoi-hai.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"
```

*Lưu ý: Nếu không cấu hình Firebase, ứng dụng vẫn hoạt động 100% đầy đủ tính năng thông qua LocalStorage trên máy người dùng.*
