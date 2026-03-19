# aitran-skills

Bộ sưu tập **skills, plugins và integrations** dành cho Claude Code — mở rộng khả năng trợ lý AI cho các tác vụ productivity, infrastructure, analytics và automation.

## Cài đặt từ Marketplace

```claude
/plugin marketplace add leolionart/aitran-skills
/plugin install <tên-plugin>
```

---

## Skills

> `skills/` chứa source content gốc. Marketplace publish các installable wrapper dưới `plugins/`, không publish trực tiếp từng thư mục skill.


### Google Workspace *(mới)*

Tương tác với toàn bộ Google Workspace qua [`gws` CLI](https://github.com/googleworkspace/cli) — một CLI thống nhất cho Gmail, Drive, Sheets, Docs, Calendar và Chat.

| Skill | Mô tả |
|-------|-------|
| `google-workspace` | Auth setup, cross-product workflows (standup report, meeting prep, weekly digest), schema discovery |
| `gws-gmail` | Gửi/reply/forward email, triage inbox, stream email mới realtime |
| `gws-drive` | List, upload, tìm kiếm, share files trên Google Drive |
| `gws-sheets` | Đọc/ghi/append Sheets data + helper script Python (CSV import/export) |

> **Yêu cầu:** `npm install -g @googleworkspace/cli` + `gws auth login`

---

### Analytics & Reporting

| Skill | Mô tả |
|-------|-------|
| `google-analytics-reader` | Query GA4 — traffic, conversions, audience segments, trend analysis |

---

### Collaboration & Messaging

| Skill | Mô tả |
|-------|-------|
| `lark-suite` | Làm việc với Lark/Feishu — messages, docs, bitable, calendar, approval. Cần `lark-mcp` để có runtime integration đầy đủ |

---

### Productivity

| Skill | Mô tả |
|-------|-------|
| `raindrop` | Quản lý bookmarks Raindrop.io — lưu, tìm kiếm, tổ chức collections |

---

### Delivery & Content

| Skill | Mô tả |
|-------|-------|
| `diagram` | Tạo sơ đồ ASCII và Mermaid — flowchart, sequence, ERD, Gantt, state machine |
| `social-image` | Tạo ảnh Facebook Stories (1080×1920) và Post (1080×1080) với background abstract |

---

### Frontend Design

| Skill | Mô tả |
|-------|-------|
| `taste-skill` | Skill thiết kế frontend chính — tăng chất lượng layout, typography, spacing, motion và cảm giác cao cấp |
| `redesign-skill` | Nâng cấp giao diện sẵn có mà không cần viết lại từ đầu — audit các điểm nhìn generic rồi cải thiện từng bước |
| `minimalist-skill` | Tạo giao diện tối giản kiểu editorial/workspace — nhiều khoảng thở, monochrome ấm, bento grid, pastel nhẹ |
| `soft-skill` | Đẩy visual polish lên mức premium agency — cấu trúc card, animation, spacing và nhịp điệu thị giác tinh tế hơn |

---

### Release & App Updates

| Skill | Mô tả |
|-------|-------|
| `save-and-release` | Lưu thay đổi, đẩy branch lên remote, chuẩn bị checklist phát hành và release notes |
| `set-up-docker-app-updates` | Thiết lập một lần để app Docker có thể build/publish version mới và rollout update an toàn |
| `set-up-macos-app-updates` | Thiết lập một lần để app macOS hiển thị version hiện tại và báo khi có bản cập nhật |

---

### Infrastructure

| Skill | Mô tả |
|-------|-------|
| `mikrotik-manager` | Quản lý router MikroTik — firewall, routing, VPN, DHCP, wireless qua RouterOS API |

---

## Plugins

Plugin mở rộng hành vi của Claude Code qua hooks — chạy tự động theo sự kiện, không cần gọi thủ công.

| Plugin | Mô tả |
|--------|-------|
| `claude-skill-tracker` | Ghi nhận mỗi lần gọi Skill và gửi telemetry về CLIProxy Dashboard (tokens, duration, tool calls) |
| `git-sync` | Auto-pull khi mở session, auto-commit + push khi Claude dừng |
| `lark-mcp` | MCP server cho Lark/Feishu — tích hợp trực tiếp Claude với Lark qua MCP protocol |

---

## Cấu trúc Repo

```text
skills/                   # Source content gốc cho từng skill
  google-workspace/
  gws-gmail/
  gws-drive/
  gws-sheets/
  google-analytics-reader/
  lark-suite/
  diagram/
  raindrop/
  mikrotik-manager/
  social-image/
  save-and-release/
  set-up-docker-app-updates/
  set-up-macos-app-updates/
  taste-skill/
  redesign-skill/
  minimalist-skill/
  soft-skill/
plugins/                  # Installable plugin roots được marketplace publish
  git-sync/
  lark-mcp/
  diagram/
    .claude-plugin/plugin.json
    skills/diagram/
  raindrop/
    .claude-plugin/plugin.json
    skills/raindrop/
  mikrotik-manager/
    .claude-plugin/plugin.json
    skills/mikrotik-manager/
  ...
hooks/
  hooks.json              # PostToolUse + Stop hooks cho skill tracker
.claude-plugin/
  plugin.json             # Root plugin manifest
  marketplace.json        # Registry tất cả installable plugins
```

---

## Skill Tracker — Cách hoạt động

Plugin `claude-skill-tracker` dùng mô hình **2-phase telemetry**:

1. Hook `PostToolUse(Skill)` gửi **Phase 1 skeleton** ngay khi skill được gọi
2. Hook `Stop` đọc transcript, parse metrics thực tế, gửi **Phase 2 enrich** với cùng `event_uid`
3. Collector merge idempotent theo `event_uid` — chỉ giữ 1 event logic/run

```bash
# Tuỳ chỉnh endpoint collector
export CLIPROXY_COLLECTOR_URL="https://your-dashboard/api/collector/skill-events"
# Mặc định: https://proxy.naai.studio/api/collector/skill-events
```

---

## License

MIT
