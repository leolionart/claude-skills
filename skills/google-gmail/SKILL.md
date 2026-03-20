---
name: google-gmail
description: Operate Gmail via the Google Workspace CLI (gws) — send emails, reply with threading, triage inbox, and stream new messages as NDJSON. Use when users ask to send/forward/reply emails, check inbox summary, or automate email workflows.
version: 1.0.0
---

# Google Gmail — Email Operations

## Khi nào dùng skill này
- Gửi email (đơn giản hoặc với attachment)
- Reply / Reply-all / Forward với đúng threading
- Xem tóm tắt inbox (triage)
- Stream email mới realtime cho automation pipeline
- Tìm kiếm và đọc email cụ thể

## Yêu cầu
- `gws` CLI đã cài và đã xác thực (`gws auth login` hoặc service account)
- Scope OAuth cần thiết: `https://mail.google.com/` hoặc `https://www.googleapis.com/auth/gmail.modify`

## Commands

### Gửi Email
```bash
gws gmail +send \
  --to recipient@example.com \
  --subject "Tiêu đề email" \
  --body "Nội dung email"

# Gửi với CC và BCC
gws gmail +send \
  --to primary@example.com \
  --cc manager@example.com \
  --bcc archive@example.com \
  --subject "Báo cáo tuần" \
  --body "Xin gửi báo cáo..."

# Gửi nhiều người (phân cách bằng dấu phẩy)
gws gmail +send \
  --to "alice@example.com,bob@example.com" \
  --subject "Thông báo chung" \
  --body "Kính gửi mọi người..."
```

### Reply với Threading
```bash
# Reply (giữ thread)
gws gmail +reply \
  --message-id MESSAGE_ID \
  --body "Cảm ơn, tôi đã nhận được."

# Reply-all
gws gmail +reply-all \
  --message-id MESSAGE_ID \
  --body "Đồng ý với đề xuất trên."

# Forward
gws gmail +forward \
  --message-id MESSAGE_ID \
  --to newrecipient@example.com \
  --body "Chuyển tiếp để bạn tham khảo."
```

### Triage Inbox
```bash
# Xem tóm tắt email chưa đọc
gws gmail +triage

# Kết quả JSON — trích xuất thông tin cụ thể
gws gmail +triage | jq '.messages[] | {from: .from, subject: .subject, date: .date}'
```

### Stream Email Mới (Realtime)
```bash
# Stream email mới dạng NDJSON (mỗi email 1 dòng JSON)
gws gmail +watch

# Pipe vào processor
gws gmail +watch | while IFS= read -r line; do
  echo "$line" | jq '.subject'
done
```

### Lấy Email Cụ thể (Discovery API)
```bash
# Lấy message theo ID
gws gmail users messages get \
  --params '{"userId": "me", "id": "MESSAGE_ID"}'

# List messages với filter
gws gmail users messages list \
  --params '{"userId": "me", "q": "from:boss@company.com is:unread", "maxResults": 10}'

# List với page-all
gws gmail users messages list \
  --params '{"userId": "me", "q": "subject:invoice", "maxResults": 100}' \
  --page-all
```

### Xem Schema
```bash
gws schema gmail.users.messages.send
gws schema gmail.users.messages.list
gws schema gmail.users.messages.get
```

## Workflow Decision Tree

```
User muốn gửi email?
  → Hỏi: to, subject, body (bắt buộc); cc, bcc (tùy chọn)
  → Dùng: gws gmail +send

User muốn reply?
  → Hỏi: message_id của email cần reply, nội dung reply
  → Nếu cần tìm message_id: gws gmail users messages list --params '{"userId":"me","q":"..."}'
  → Dùng: gws gmail +reply hoặc +reply-all

User muốn xem inbox?
  → Dùng: gws gmail +triage
  → Parse JSON, hiển thị bảng ngắn gọn

User muốn tự động xử lý email mới?
  → Dùng: gws gmail +watch | <processor>
```

## Output Standards

- Mặc định hiển thị bảng tóm tắt: `message_id`, `from`, `subject`, `date`, `snippet`
- Với triage: nhóm theo "Unread", "Today", "This week"
- Không in nội dung email đầy đủ trừ khi user yêu cầu (có thể chứa thông tin nhạy cảm)
- Nếu gửi thành công: xác nhận với message_id để user có thể trace

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|------------|-----------|
| Exit 2 | Auth lỗi | `gws auth login` lại hoặc kiểm tra scope Gmail |
| "Insufficient Permission" | Thiếu OAuth scope | Thêm scope `https://mail.google.com/` trong GCP Console |
| "Invalid message ID" | Message ID không tồn tại | Dùng list trước để lấy đúng ID |
| Rate limit | Gửi quá nhiều | Thêm delay giữa các lần gửi batch |

## Bảo mật

- Không log nội dung email chứa thông tin cá nhân / mật khẩu / token
- Với email batch tự động: luôn dry-run trước (`--dry-run`)
- Khi forward email: kiểm tra nội dung trước để tránh leak thông tin nhạy cảm
