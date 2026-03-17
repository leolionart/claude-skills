---
name: lark-suite
description: This skill should be used when configuring Lark MCP and querying Lark task/tasklist data from Claude Code in this repository.
version: 1.0.0
---

# Lark Suite MCP workflow

## Mục tiêu
- Kích hoạt MCP server `lark-mcp` an toàn (không hardcode secrets).
- Truy vấn dữ liệu task/tasklist từ Lark qua MCP tools đã bật.
- Chuẩn hoá output để dùng cho dashboard, báo cáo, hoặc đối chiếu vận hành.

## Khi nào dùng skill này
- Khi user muốn cài hoặc kiểm tra cấu hình Lark MCP trong repo này.
- Khi cần lấy danh sách task/tasklist hoặc chi tiết task từ Lark.
- Khi cần tóm tắt trạng thái công việc Lark theo bộ lọc (owner, trạng thái, thời gian).

## Quy trình thực thi
1. Kiểm tra file `.mcp.json` ở root repo.
   - Nếu chưa có: copy từ `.mcp.json.example`.
   - Không ghi secrets thật vào file được commit.
2. Đảm bảo env đã set: `LARK_APP_ID`, `LARK_APP_SECRET`, `LARK_DOMAIN`, `LARK_TOOLSETS`.
3. Xác nhận `lark-mcp` server khởi động được trong Claude Code.
4. Khi truy vấn dữ liệu:
   - Ưu tiên list trước, rồi get chi tiết theo ID để giảm noise.
   - Trả về bảng ngắn gọn: `task_id`, `title`, `status`, `assignee`, `updated_at`.
5. Nếu lỗi auth hoặc tool unavailable:
   - Báo rõ biến env còn thiếu.
   - Đề xuất kiểm tra lại `.mcp.json` và reload session.

## Chuẩn output khuyến nghị
- Mặc định trả summary 5–20 dòng, thêm chi tiết khi user yêu cầu.
- Giữ nguyên ID gốc của Lark để trace ngược.
- Với nhiều task, nhóm theo trạng thái để dễ đọc.

## Ghi nhớ an toàn
- Không commit `.mcp.json` chứa secret.
- Không in full secret ra output/log.
- Khi cần chia sẻ cấu hình, chỉ chia sẻ `.mcp.json.example` + `.env.example`.
