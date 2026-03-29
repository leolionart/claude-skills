# aitran-skills

Bộ sưu tập **skills** và **plugins** cho Claude Code, đóng gói để cài qua Claude Marketplace.

## Cài đặt từ Marketplace

```claude
/plugin marketplace add leolionart/claude-skills
/plugin install <tên-plugin>
```

## Repo này chứa gì?

- `plugins/`: các plugin/skill wrapper được publish để cài từ Marketplace, mỗi plugin có source root riêng để tránh lẫn namespace skill
- `skills/`: source content gốc cho từng skill
- `.claude-plugin/`: metadata marketplace và registry plugin
- `hooks/`: hooks dùng cho các plugin cần automation
- `scripts/`: script phụ trợ cho một số plugin/skill

## Nhóm skill chính

### Productivity & Workspace
- `google-workspace`
- `google-gmail`
- `google-drive`
- `google-sheets`
- `raindrop`
- `lark-suite`

> Với nhóm Google Workspace cần `gws` CLI: `npm install -g @googleworkspace/cli` rồi `gws auth login`.

### Analytics & Reporting
- `google-analytics-reader`
- `claude-skill-tracker`

### Delivery & Automation
- `diagram`
- `social-image`
- `save-and-release`
- `set-up-docker-app-updates`
- `set-up-macos-app-updates`
- `mcp-to-cli`
- `telegram-permission-alert` — gửi Telegram khi Claude Code đang chờ bạn approve permission prompt, dùng một chat chung cho mọi project

### Frontend Design
- `design-ui` — canonical shareable UI design skill with 6 families and 20 exemplar styles for choosing, reviewing, and converting visual direction
- `redesign-skill`

### Infrastructure & Collaboration
- `mikrotik-manager`
- `jira-task-manager`
- `confluence-publishing`
- `lark-mcp`
- `git-sync`

## Cấu trúc repo

```text
.claude-plugin/   # metadata marketplace + registry plugin
plugins/          # installable plugin roots
skills/           # source content gốc cho từng skill
```

## Ghi chú

- `skills/` không được publish trực tiếp; Marketplace cài các package dưới `plugins/`.
- Plugin `claude-skill-tracker` là plugin hook-only dưới `plugins/claude-skill-tracker/`, dùng hooks để gửi telemetry 2-phase về CLIProxy Dashboard cho cả `Skill`, `Agent`, và `SendMessage` activity.
- `telegram-permission-alert` cần `CC_TELEGRAM_ALERT_BOT_TOKEN` và `CC_TELEGRAM_ALERT_CHAT_ID`. Plugin chỉ gửi metadata tối thiểu như project/tool/session để tránh đẩy raw command hoặc nội dung pending lên Telegram.
- Cài nhanh:

```claude
/plugin install telegram-permission-alert
```

- Cấu hình global cho mọi project bằng cách paste các lệnh này vào Claude Code rồi thay giá trị thật trước khi chạy:

```bash
!cat <<'EOF' >> ~/.zshrc
export CC_TELEGRAM_ALERT_BOT_TOKEN='123456:ABCDEF'
export CC_TELEGRAM_ALERT_CHAT_ID='123456789'
# Optional:
# export CC_TELEGRAM_ALERT_PREFIX='Claude Code needs approval'
# export CC_TELEGRAM_ALERT_NOTIFY_ON='permission-request'
EOF
source ~/.zshrc
```

Hook dùng `PermissionRequest`, nên timing bám theo permission dialog native của Claude Code. Sau khi `source ~/.zshrc`, mở session Claude Code mới nếu session hiện tại chưa thấy env mới.

## License

MIT
