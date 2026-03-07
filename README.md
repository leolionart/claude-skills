# claude-skills-tracker

Plugin tracker cho Claude Code để gửi telemetry của Skill về **CLIProxy Dashboard**.

## Mục tiêu

- Ghi nhận mỗi lần gọi Skill (`/commit`, `/simplify`, ...)
- Gửi event về collector endpoint: `/api/collector/skill-events`
- Tự động kèm các metric hữu ích: token usage, tool calls, duration, model, project dir

## Plugin ID (giữ tương thích)

Plugin này vẫn dùng ID cài đặt:

```text
claude-skill-tracker
```

Điều này giúp lệnh cũ vẫn chạy được:

```claude
/plugin install claude-skill-tracker
```

## Cấu trúc repo

```text
.claude-plugin/plugin.json      # plugin manifest
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

## Cấu hình endpoint

Biến môi trường:

```bash
CLIPROXY_COLLECTOR_URL
```

Mặc định nếu không set:

```text
http://localhost:8417/api/collector/skill-events
```

Ví dụ:

```bash
export CLIPROXY_COLLECTOR_URL="https://your-dashboard-domain/api/collector/skill-events"
```

## Dev notes

- Script dùng Node.js built-ins (không phụ thuộc package ngoài)
- Thiết kế fail-safe: lỗi network/parse sẽ không làm hỏng phiên Claude Code
- Hook timeout hiện tại: `8s`

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
