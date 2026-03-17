# claude-skills-tracker

Plugin tracker cho Claude Code để gửi telemetry của Skill về **CLIProxy Dashboard**.

## Mục tiêu

- Ghi nhận mỗi lần gọi Skill (`/commit`, `/simplify`, ...)
- Gửi event về collector endpoint: `/api/collector/skill-events`
- Dùng mô hình **2-phase telemetry** để vừa không mất trace, vừa có metrics gần thực tế

## Plugin ID & cài từ marketplace

- **Marketplace repo:** `leolionart/claude-skills-tracker`
- **Plugin install ID:** `claude-skill-tracker`

```claude
/plugin marketplace add leolionart/claude-skills-tracker
/plugin install claude-skill-tracker
```

## Cấu trúc repo

```text
hooks/hooks.json                # đăng ký PostToolUse(Skill) + Stop hooks
scripts/on-skill-use.mjs        # Phase 1: skeleton event
scripts/on-stop.mjs             # Phase 2: final enrichment
package.json
README.md
```

## Cách hoạt động (2-phase telemetry)

1. Claude Code gọi tool `Skill`.
2. Hook `PostToolUse` chạy `scripts/on-skill-use.mjs` và gửi **Phase 1 skeleton** (`is_skeleton=true`).
3. Claude tiếp tục thực thi nội dung skill.
4. Khi phiên dừng, hook `Stop` chạy `scripts/on-stop.mjs`:
   - đọc transcript,
   - tìm lần gọi skill gần nhất,
   - parse metrics thực tế hơn,
   - gửi **Phase 2 final enrich** với cùng `event_uid`, `is_skeleton=false`.
5. Collector merge theo `event_uid` để chỉ giữ 1 row logic/run (idempotent).

## Data contract

### Immutable fields (không đổi giữa phase 1/2)

- `event_uid`
- `machine_id`
- `session_id`
- `skill_name`
- `tool_use_id`
- `attempt_no`
- `triggered_at`

### Enrich fields (phase 2 có thể nâng chất lượng)

- `tokens_used`
- `output_tokens`
- `tool_calls`
- `duration_ms`
- `model`
- `status`
- `error_type`
- `error_message`
- `is_skeleton`
- `synced_at`

## Identity / Idempotency

- `event_uid` = `SHA1(machine_id|session_id|skill_name|tool_use_id|attempt_no)`
- Cả phase 1 và phase 2 phải dùng cùng công thức để merge vào cùng một event.
- Nếu collector nhận lại payload lặp (retry/replay), upsert vẫn giữ idempotent.

## Cấu hình endpoint

Biến môi trường:

```bash
CLIPROXY_COLLECTOR_URL
```

Mặc định nếu không set:

```text
https://proxy.naai.studio/api/collector/skill-events
```

Ví dụ override:

```bash
export CLIPROXY_COLLECTOR_URL="https://your-dashboard-domain/api/collector/skill-events"
```

## Edge cases / Known limitations

- Nếu session kết thúc bất thường trước khi `Stop` hook chạy, event có thể chỉ còn skeleton.
- Một số skill rất ngắn vẫn có metrics thấp; đây là hành vi thực tế của runtime, không phải duplicate.
- Parse transcript là heuristic: với cấu trúc transcript khác thường, quality metrics có thể chưa tối ưu nhưng không làm hỏng ingest.

## Dev notes

- Script dùng Node.js built-ins (không phụ thuộc package ngoài)
- Thiết kế fail-safe: lỗi network/parse không làm hỏng phiên Claude Code
- Hook timeout: `8s` (phase 1) và `10s` (phase 2)

## Kiểm tra nhanh

1. Trong Claude Code, chạy:
   - `/plugin marketplace add leolionart/claude-skills-tracker`
   - `/plugin install claude-skill-tracker`
2. Chạy `/reload-plugins` hoặc mở Claude Code mới (`/exit` rồi mở lại)
3. Chạy một skill bất kỳ (ví dụ `/commit`)
4. Dừng phiên để `Stop` hook fire
5. Kiểm tra tab **Skills** trên dashboard

Nếu không thấy dữ liệu:

- Kiểm tra `CLIPROXY_COLLECTOR_URL`
- Kiểm tra collector endpoint đang chạy
- Kiểm tra collector log có nhận cả phase 1 và phase 2

## License

MIT
