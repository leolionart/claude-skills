---
name: google-analytics-reader
description: Read and summarize Google Analytics 4 (GA4) data using the Google Analytics Data API. This skill should be used when users ask to fetch website/app metrics, compare date ranges, inspect traffic sources, or build quick performance reports from GA4 properties.
---

# Google Analytics Reader

## Overview
Đọc dữ liệu GA4 (sessions, users, conversions, revenue, traffic source) bằng Google Analytics Data API, sau đó tóm tắt kết quả theo yêu cầu người dùng.

## Workflow Decision Tree
- Nếu thiếu thông tin truy vấn (property ID, date range, metrics/dimensions): hỏi bổ sung ngắn gọn trước khi chạy.
- Nếu user chỉ muốn “báo cáo nhanh”: dùng preset ở `scripts/ga4_query.py --preset overview`.
- Nếu user muốn truy vấn tùy chỉnh: truyền `--metrics`, `--dimensions`, `--start-date`, `--end-date`.
- Mặc định mọi báo cáo phải có phân bổ theo `hostName` để tách traffic theo domain/subdomain.
- Nếu user yêu cầu lưu/ghi nhớ đường dẫn credential: hỏi xác nhận, sau đó chỉ lưu *đường dẫn* (không lưu file JSON hoặc secrets) vào memory theo chính sách bảo mật.
- Nếu gặp lỗi xác thực: kiểm tra `GOOGLE_APPLICATION_CREDENTIALS` và quyền `Viewer/Analyst` cho service account trên GA4 property.

## Quick Start
1. Xác nhận đã có credential JSON của service account.
2. Export biến môi trường (chỉ đường dẫn):
   - `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`
   - LƯU Ý: skill sẽ hiển thị **chỉ đường dẫn** credential trong header báo cáo nếu user yêu cầu, KHÔNG bao giờ in nội dung JSON hoặc khoá.
3. Chạy truy vấn mẫu:
   - `python3 scripts/ga4_query.py --property-id 123456789 --preset overview --start-date 7daysAgo --end-date yesterday`
4. Tóm tắt insight:
   - nêu rõ: Property ID, Credential path (nếu có và nếu user cho phép hiển thị), date range, timezone.
   - luôn trình bày theo: Top landing page (landingPagePlusQueryString) → breakdown theo path (pagePath / landing page path).

## Query Patterns
### 1) Tổng quan hiệu suất
- Metrics: `activeUsers,sessions,screenPageViews,eventCount,totalRevenue`
- Dimensions: `date`
- Bổ sung breakdown bắt buộc theo `hostName` (ít nhất một bảng top host theo sessions).

### 2) Nguồn traffic
- Metrics: `sessions,activeUsers,conversions`
- Dimensions: `sessionDefaultChannelGroup`
- Nếu property có nhiều domain/subdomain, thêm breakdown theo `hostName`.

### 3) Landing pages (BẮT BUỘC trong báo cáo)
- Metrics: `sessions,engagedSessions,conversions,pageviews`
- Dimensions: `hostName,landingPagePlusQueryString,pagePath`
- Mục tiêu: Liệt kê top N landing pages (mặc định N=10) theo sessions, và cung cấp đường dẫn (path) rõ ràng để biết bài viết/URL nào được xem nhiều trên từng hostname.

### 4) Clean landing theo hostname (Khuyến nghị mặc định)
- Chuẩn hoá `landingPagePlusQueryString` về path (loại query params như `fbclid`, `utm_*`) trước khi tổng hợp.
- Báo cáo theo tổ hợp `hostName + clean_landing_path` để tránh trộn `/` giữa nhiều subdomain.

## Output Standards (bắt buộc)
- Header báo cáo phải ghi rõ:
  - Property ID (ví dụ: 389983311)
  - Credential path (chỉ đường dẫn) — chỉ hiển thị khi biến môi trường `GOOGLE_APPLICATION_CREDENTIALS` đã được set và khi user đồng ý lưu/hiển thị; KHÔNG bao gồm nội dung file.
  - Date range và timezone (nếu có).
- Luôn có 3 phần chính trong body kết quả:
  1) Tổng quan nhanh (Active users, Sessions, Pageviews, Events, Revenue).
  2) Phân bổ theo hostname (bảng): cột tối thiểu = [hostName, sessions, engagedSessions (nếu có), pageviews, conversions]. Sắp xếp theo sessions giảm dần.
  3) Landing pages (bảng): cột tối thiểu = [hostName, landing_page (path), sessions, engagedSessions, pageviews, conversions]. Sắp xếp theo sessions giảm dần.
- Mặc định chuẩn hoá landing page về clean path (loại query params như `fbclid`, `utm_*`) trước khi tổng hợp; nếu cần giữ raw URL thì trình bày thêm bảng phụ.
- Nếu user yêu cầu chi tiết theo path: thêm breakdown `pagePath` cho từng landing page (một bảng nhỏ hoặc link tới CSV).
- Nếu số liệu bất thường (biến đổi >50% so với baseline hoặc giá trị bằng 0 ở metric quan trọng): nêu 2–3 giả thuyết ngắn và gợi ý kiểm tra tiếp.
- Bảo mật: KHÔNG in nội dung credential hoặc token; nếu credential thiếu/không hợp lệ, báo lỗi xác thực và hướng dẫn cách cài đặt `GOOGLE_APPLICATION_CREDENTIALS`.

## Interaction / UX
- Khi user gọi báo cáo nhanh: chạy preset `overview` và trả về header + tổng quan + bảng phân bổ theo hostname + top landing pages theo hostname (mặc định top 10).
- Nếu user không nói gì thêm, mặc định xuất bản clean (đã loại query params) và thêm 1 bảng raw ngắn để đối chiếu khi cần.
- Luôn hỏi ngắn nếu thiếu quyền hoặc credential: “Thưa ngài — credential đã set chưa? Nếu chưa, ngài muốn tôi lưu đường dẫn credential vào memory không?”
- Nếu user chọn lưu đường dẫn credential, ghi nhận chỉ *đường dẫn* vào memory theo policy và thông báo đã lưu.

## Resources
- `scripts/ga4_query.py`: CLI truy vấn GA4 với preset hoặc custom metrics/dimensions.
- `references/setup.md`: hướng dẫn cấp quyền service account + lỗi thường gặp.

## Notes / Safety
- Không lưu bất kỳ nội dung file JSON credential nào trong repo hoặc memory; chỉ lưu đường dẫn nếu user yêu cầu.
- Khi báo cáo được export (CSV/JSON), nếu file chứa dữ liệu nhạy cảm, hỏi xác nhận trước khi upload/chia sẻ.
