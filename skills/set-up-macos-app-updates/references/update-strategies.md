# Set Up macOS App Updates — Update Strategies

## Có 3 mức độ phổ biến

### 1) Chỉ báo có bản mới
App hiển thị:
- version hiện tại
- có bản mới hay không
- nút mở trang download hoặc release page

**Phù hợp khi:**
- muốn setup đơn giản
- cần user tự quyết định khi nào update
- chưa muốn tích hợp full auto-update framework

### 2) Hỗ trợ in-app update có kiểm soát
App có thể:
- kiểm tra version mới
- hiển thị changelog ngắn
- hướng user vào flow update đã chuẩn hoá

**Phù hợp khi:**
- muốn trải nghiệm mượt hơn
- đã có nơi publish metadata version ổn định

### 3) Full auto-update
App tự tải và cài bản mới theo framework/platform phù hợp.

**Phù hợp khi:**
- đã có signing, notarization, publish pipeline và rollback story rõ ràng
- team sẵn sàng chịu thêm độ phức tạp vận hành

## Khuyến nghị mặc định
Với audience rộng, nên bắt đầu từ:
- hiển thị version hiện tại
- kiểm tra version mới
- báo “update available”
- cho user mở release/download page

Đây là mức dễ hiểu, dễ verify và ít rủi ro nhất.
