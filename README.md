# aitran-skills

Bộ sưu tập **skills** và **plugins** cho Claude Code, đóng gói để cài qua Claude Marketplace.

## Cài đặt từ Marketplace

```claude
/plugin marketplace add leolionart/claude-skills
/plugin install <tên-plugin>
```

## Repo này chứa gì?

- `plugins/`: các plugin/skill wrapper được publish để cài từ Marketplace
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
hooks/            # hook definitions cho plugin automation
scripts/          # helper scripts
```

## Ghi chú

- `skills/` không được publish trực tiếp; Marketplace cài các package dưới `plugins/`.
- Plugin `claude-skill-tracker` dùng hooks để gửi telemetry về CLIProxy Dashboard khi skill được gọi.

## License

MIT
