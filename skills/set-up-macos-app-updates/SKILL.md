---
name: set-up-macos-app-updates
description: Set up in-app update basics for a macOS app so the app can show its current version and tell users when an update is available.
version: 1.0.0
---

# Set Up macOS App Updates

## Overview
Dùng skill này khi bạn muốn **thiết lập một lần** để ứng dụng macOS có thể hiển thị version hiện tại, kiểm tra version mới, và báo cho người dùng biết khi có bản cập nhật.

Skill này phù hợp cho các dự án muốn có trải nghiệm “in-app update available” dễ hiểu mà không cần bắt đầu bằng thuật ngữ phức tạp.

## Khi nào dùng skill này
- Bạn đang làm app macOS và muốn app tự báo có version mới
- Bạn muốn chuẩn hoá nơi app đọc thông tin version mới nhất
- Bạn muốn thiết kế luồng update thân thiện với người dùng cuối
- Bạn muốn có checklist verify/rollback cho cơ chế update

## Inputs required
- App macOS đang phát hành theo kiểu nào: direct download, signed package, DMG, zip, v.v.
- App đang lấy version từ đâu
- Nơi sẽ publish thông tin version mới: feed file, API endpoint, release metadata
- App chỉ cần báo “có bản mới” hay cần hỗ trợ full in-app update flow

## Workflow / Decision tree
1. **Show current version**
   - Hiển thị version build hiện tại trong app
   - Đảm bảo version format nhất quán với quy trình phát hành

2. **Check latest available version**
   - Chọn một nguồn tin cậy để app đọc metadata phiên bản mới nhất
   - So sánh version đang chạy với version mới nhất đã publish

3. **Show update available state**
   - Nếu có version mới: hiển thị thông báo rõ ràng, có link hoặc action tiếp theo
   - Nếu không có: hiển thị trạng thái up to date gọn nhẹ

4. **Plan verification and rollback**
   - Xác định cách test với version cũ/mới
   - Xác định cách rút bản phát hành lỗi hoặc ngăn app đề xuất bản lỗi

## Output standards
- Trình bày theo ngôn ngữ dễ hiểu cho người không rành release engineering
- Nêu rõ phần nào là “bắt buộc để app báo có bản mới” và phần nào là “nâng cao”
- Ưu tiên pattern đơn giản: version hiện tại + nguồn version mới nhất + thông báo update

## Failure modes / lỗi thường gặp
- App không hiển thị rõ version đang chạy
- Metadata version mới không ổn định hoặc không đồng bộ với release thật
- Logic so sánh version sai vì format version không nhất quán
- Không có cách tắt/rút lại update đã publish lỗi

## Safety notes
- Không hứa hẹn full auto-update nếu dự án mới chỉ cần “update available”
- Không gắn chặt skill vào một framework update cụ thể nếu user chưa chọn
- Luôn giữ đường rollback đơn giản: rút metadata, gỡ release lỗi, hoặc đổi version target

## Resources
- `references/update-strategies.md` — So sánh các mô hình update cho app
- `references/version-check-pattern.md` — Pattern hiển thị version hiện tại và kiểm tra bản mới
