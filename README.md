# aitran-skills

Bộ sưu tập **skills, plugins và integrations** dành cho Claude Code — mở rộng khả năng trợ lý AI cho các tác vụ productivity, infrastructure, analytics và automation.

## Cài đặt từ Marketplace

```claude
/plugin marketplace add leolionart/claude-skills
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
| `google-gmail` | Gửi/reply/forward email, triage inbox, stream email mới realtime |
| `google-drive` | List, upload, tìm kiếm, share files trên Google Drive |
| `google-sheets` | Đọc/ghi/append Sheets data + helper script Python (CSV import/export) |

> **Yêu cầu:** `npm install -g @googleworkspace/cli` + `gws auth login`

---

### Analytics & Reporting

| Skill | Mô tả |
|-------|-------|
| `google-analytics-reader` | Query GA4 — traffic, conversions, audience segments, trend analysis |

---

### Automation

| Skill | Mô tả |
|-------|-------|
| `mcp-to-cli` | Generate standalone CLIs or make one-off tool calls from MCP servers using mcporter. Use when the user wants to convert an MCP into a compiled CLI, inspect available MCP tools, import MCP definitions from Claude Code/Cursor/Codex, authenticate remote HTTP MCPs, or call MCP tools without registering the server in Claude Code. |

---

### Atlassian Workflow

| Skill | Mô tả |
|-------|-------|
| `jira-task-manager` | Create and manage Jira tasks for the AI project, assign tasks to correct team members, assign to sprints, and link to appropriate Epics. Use when user wants to create, update, or manage Jira tickets. |
| `confluence-publishing` | Publish markdown deliverables to Confluence with compliant formatting, metadata syncing, and automation hooks. Use when the user wants to publish a document to Confluence, update an existing Confluence page, sync local markdown to Confluence, or mentions push to Confluence, đăng lên Confluence, or cập nhật trang Confluence. |

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

Quick visual overview: [visual gallery microsite](./docs/)

> Public docs now ship as a Jekyll-powered GitHub Pages showcase built from `docs/` via the repo's Pages workflow. The public IA stays intentionally simple, but the presentation is now gallery-first: the homepage behaves like a visual wall of `design-ui` directions, and each card opens a dedicated detail page staged like a case study for the same shared scenario.
>
> Local preview:
> - `npm run docs:bundle`
> - `npm run docs:serve`
> - or `npm run docs:build` for a one-off local build into `_site/`
>
> The npm scripts force Bundler to install into `vendor/bundle` locally so preview does not need sudo or write into system Ruby gems.

#### Recommended

| Skill | Mô tả |
|-------|-------|
| `design-ui` | Skill frontend/UI canonical cho tạo mới, polish, style direction, và refinement. Public docs của skill này là homepage style list dẫn vào 4 demo detail pages canonical: `default high-agency`, `minimalist editorial`, `premium polish`, `structured technical` |
| `redesign-skill` | Workflow audit-first riêng để nâng cấp project đang có mà không rewrite — giữ stack/chức năng, cải thiện giao diện theo hướng low-risk; không nằm trong public style gallery của docs |

#### Which one should I use?

| Tình huống | Skill nên dùng |
|------------|-----------------|
| Tạo mới hoặc cải thiện UI nói chung | `design-ui` |
| Muốn style minimal/editorial | `design-ui` + nói rõ mode `minimalist editorial` |
| Muốn giao diện premium/polished | `design-ui` + nói rõ mode `premium polish` |
| Muốn giao diện kỹ thuật, rõ ràng, modular | `design-ui` + nói rõ mode `structured technical` |
| Muốn redesign project hiện có, giữ stack/chức năng | `redesign-skill` |

Quick demo highlights:
- Browse a gallery-style homepage wall for the 4 canonical `design-ui` directions: `default high-agency`, `minimalist editorial`, `premium polish`, `structured technical`
- Open a dedicated showcase page for each style on the same pseudo-UI scenario
- Compare how typography, spacing, hierarchy, material treatment, and artifact staging shift from one style to another

### Release & App Updates

| Skill | Mô tả |
|-------|-------|
| `save-and-release` | Lưu thay đổi, đẩy branch lên remote, và hỗ trợ GitHub release với version bump, tag, release notes, cùng advisory gitleaks check |
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
  google-gmail/
  google-drive/
  google-sheets/
  google-analytics-reader/
  lark-suite/
  diagram/
  raindrop/
  mikrotik-manager/
  social-image/
  save-and-release/
  set-up-docker-app-updates/
  set-up-macos-app-updates/
  design-ui/
  redesign-skill/
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
