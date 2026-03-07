# claude-skills-tracker

Plugin tracker cho Claude Code để gửi telemetry của Skill về **CLIProxy Dashboard**.

## Mục tiêu

- Ghi nhận mỗi lần gọi Skill (`/commit`, `/simplify`, ...)
- Gửi event về collector endpoint: `/api/collector/skill-events`
- Tự động kèm các metric hữu ích: token usage, tool calls, duration, model, project dir

## Plugin ID (giữ tương thích)

Plugin này dùng ID cài đặt:

```text
claude-skill-tracker
```

```claude
/plugin install claude-skill-tracker
```

## Cấu trúc repo

```text
hooks/hooks.json                # đăng ký PostToolUse hook cho Skill
scripts/on-skill-use.mjs        # script gửi event telemetry
package.json
README.md
```

## Cách hoạt động

1. Claude Code gọi tool `Skill`.
2. Hook `PostToolUse` chạy script `scripts/on-skill-use.mjs`.
3. Script đọc payload từ stdin.
4. Script parse transcript JSONL (`transcript_path`) để lấy thêm metrics.
5. Script POST về collector URL.

Event gửi lên bao gồm:

- `skill_name`, `session_id`, `tool_use_id`, `arguments`
- `tokens_used`, `output_tokens`, `tool_calls`, `duration_ms`, `model`
- `status`, `error_type`, `error_message`, `attempt_no`
- `project_dir`, `machine_id`, `event_uid`

## Giới hạn đã biết (Known Limitations)

### Token metrics thường bằng 0 hoặc rất nhỏ

Hook `PostToolUse` trên `Skill` fires **ngay sau khi Skill tool trả về prompt text** — tức là TRƯỚC khi Claude thực sự thực thi nội dung skill đó. Transcript tại thời điểm hook chạy chỉ chứa:

```
[...các turn trước]
[assistant] → calls Skill tool   ← captured window
[tool_result] = "# Simplify: ..."
                                  ← hook fires here
[assistant] → executes skill      ← CHƯA có trong transcript
```

Vì vậy:

- **Hầu hết skills**: `tokens_used` phản ánh turn nhỏ mà Claude dùng để gọi Skill tool, không phải công việc thực tế của skill.
- **Skills gọi external API trong cùng 1 turn** (vd: `image-generator` dùng MCP tool): những calls đó hoàn thành trước khi hook fires → token được capture chính xác.

### Model thường bị NULL (đã fix v1.0.1)

Claude Code lưu model trong transcript theo format `entry.message.model` (nested), không phải `entry.model` (flat). Bug này đã được fix — model sẽ được đọc đúng từ cả hai format.

## Cấu hình endpoint

Biến môi trường:

```bash
CLIPROXY_COLLECTOR_URL
```

Mặc định nếu không set:

```text
http://localhost:8417/api/collector/skill-events
```

Ví dụ override:

```bash
export CLIPROXY_COLLECTOR_URL="https://your-dashboard-domain/api/collector/skill-events"
```

## Dev notes

- Script dùng Node.js built-ins (không phụ thuộc package ngoài)
- Thiết kế fail-safe: lỗi network/parse sẽ không làm hỏng phiên Claude Code
- Hook timeout: `8s`
- `event_uid` = SHA1 của `machine_id|session_id|skill_name|tool_use_id|attempt_no` — dùng cho upsert idempotent

## Kiểm tra nhanh

1. Cài plugin qua marketplace của dashboard
2. Mở Claude Code mới (`/exit` rồi mở lại)
3. Chạy một skill bất kỳ (ví dụ `/commit`)
4. Kiểm tra tab **Skills** trên dashboard

Nếu không thấy dữ liệu:

- Kiểm tra `CLIPROXY_COLLECTOR_URL`
- Kiểm tra collector endpoint đang chạy
- Đảm bảo không chạy song song manual hook + plugin hook (tránh duplicate)

## License

MIT
