# Set Up macOS App Updates — Version Check Pattern

## Pattern cơ bản
Một flow đơn giản, dễ áp dụng thường gồm 3 phần:

1. **Current version**
   - App biết version đang chạy
   - Hiển thị trong About screen, Settings, hoặc Admin area

2. **Latest version source**
   - Một nguồn metadata ổn định chứa version mới nhất
   - Có thể là JSON file, API endpoint, feed file, hoặc release metadata

3. **Comparison + UI state**
   - Nếu version mới lớn hơn version hiện tại: báo `Update available`
   - Nếu không: hiển thị `Up to date`

## Cần quyết định gì
- Version format sẽ là gì: `1.2.3`, `2026.03.18`, hay format khác
- App đọc metadata từ đâu
- App sẽ chỉ báo có bản mới hay có nút update/download trực tiếp

## Verification checklist
- App hiển thị đúng version đang chạy
- Metadata version mới nhất khớp release thật
- So sánh version đúng với cả patch/minor/major updates
- UI không báo nhầm khi metadata tạm thời lỗi hoặc chưa cập nhật

## Rollback checklist
- Có thể rút/gỡ metadata của bản lỗi
- Có thể trỏ người dùng về bản ổn định trước đó
- Nếu release bị lỗi, app không tiếp tục gợi ý update sang bản lỗi
