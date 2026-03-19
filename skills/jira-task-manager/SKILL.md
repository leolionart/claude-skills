---
name: jira-task-manager
description: Create and manage Jira tasks for the AI project, assign tasks to correct team members, assign to sprints, and link to appropriate Epics. Use when user wants to create, update, or manage Jira tickets.
version: 1.0.0
category: productivity
updated: 2026-03-19
---

# Jira Workflow — Tạo task và quản lý trên Jira

> **Agent Delegation**: Ưu tiên chạy qua sub-agent Jira chuyên biệt để tiết kiệm context window. Nếu runtime không có agent Jira chuyên biệt, fallback sang general-purpose và nhúng workflow bên dưới vào prompt.

## Prerequisites
- Điền biến môi trường Atlassian phù hợp trong `.mcp.json` hoặc môi trường shell của bạn.
- Chạy `./scripts/generate_atlassian_clis.sh` để tạo `scripts/mcp-atlassian` và refresh wrappers.
- Dùng `scripts/jira-mcp` cho mọi thao tác Jira thay vì gọi trực tiếp MCP server trong chat flow nặng dữ liệu.

## Khi tạo task mới cho một sprint, bạn cần thực hiện đầy đủ các bước sau:

### Bước 1: Tạo Jira issue
- Dùng CLI `scripts/jira-mcp jira-create-issue` với project_key `AI`.
- Điền đầy đủ thông tin: `summary`, `description` (dùng format Jira markup), `priority`, `labels`.
- **Quy tắc Assignee**:
  - Gán cho **Thiện** (`thien.lai@vexere.com`): Các tasks liên quan đến Langfuse, Logfire, truy cập Log, Tracing, Debug, Input/Output context metadata, hoặc Token.
  - Gán cho **Khánh** (`khanh.huynh@vexere.com`): Các tasks liên quan đến Knowledge Base, Article, Content, SOP, OmniAgent UI, tính năng giao diện người dùng (edit/xoá).

### Bước 2: Gán task vào đúng sprint trên Jira
- Dùng `scripts/jira-mcp jira-get-sprints-from-board --board-id "168" --state "active" --limit 5 --output json` để tìm sprint đang chạy, và `--state "future" --limit 5 --output json` cho sprint kế tiếp (dùng `jira-get-agile-boards` nếu cần xác nhận lại board).
- Lọc các sprint có `state: "active"` hoặc `state: "future"` để chọn đúng sprint (ví dụ: Sprint 17).
- Gán Sprint khi tạo task (thông qua `additional_fields` với `customfield_10107: <Sprint ID>`) hoặc cập nhật sau đó bằng `scripts/jira-mcp jira-update-issue`.
- **QUAN TRỌNG**: Chỉ tạo issue trên Jira mà KHÔNG gán vào sprint là chưa đủ. Phải đảm bảo task đã vào đúng Sprint (active) đang chạy.

### Bước 3: Link task vào Epic tương ứng
- Dùng `scripts/jira-mcp jira-search --jql "project = AI AND issuetype = Epic AND status != Done AND status != Closed" --fields "key,summary,status,assignee,priority,issuetype,updated" --limit 100 --output json` để tìm các Epics đang mở trong dự án.
- Xác định Epic phù hợp dựa theo chủ đề task. Ví dụ hiện tại:
  - Các tasks về **Langfuse, Tracing, Log, Debug** -> Gán vào Epic liên quan tới "Debug & Tracing" (ví dụ: AI-439).
  - Các tasks về **Knowledge Base, SOP, Content** -> Gán vào Epic liên quan tới "Knowledge Deduplication" hoặc "Knowledge Enhancement" (ví dụ: AI-265).
- Sử dụng `scripts/jira-mcp jira-update-issue` với field `customfield_10103: <Epic_Key>` để gán vào Epic phù hợp (Không sử dụng `jira-link-to-epic` vì sẽ không đúng định dạng Epic Link của Jira).

### Bước 4: Cập nhật tài liệu Sprint Goal (Nếu cần)
- Nếu repo hiện tại có tài liệu sprint goal, thêm task vào artifact sprint tương ứng.
- Cập nhật cả ở section tổng quan công việc mới và section chi tiết task nếu team bạn đang dùng format tương tự.

## Các lưu ý khác
- Luôn hỏi user muốn đưa vào sprint nào nếu có nhiều tuỳ chọn tương lai.
- Khi link issues (block, relate) với nhau dùng `scripts/jira-mcp jira-create-issue-link` — chú ý có thể fail nếu issue target chưa tồn tại.
- Board ID (168) và Sprint ID: luôn luôn nên query để lấy số liệu thực tế tại thời điểm đó thay vì hardcode chết số ID vì nó thay đổi hàng tuần.

## Bundled CLI Files
- `scripts/generate_atlassian_clis.sh` — import `mcp-atlassian` từ `.mcp.json`, tạo `config/mcporter.json`, compile `scripts/mcp-atlassian`, rồi refresh wrappers.
- `scripts/jira-mcp` — Jira wrapper với lean defaults và `--output json` compatibility.
- `scripts/confluence-mcp` — Confluence wrapper dùng chung từ cùng bộ Atlassian binary.
- `references/atlassian_cli.md` — quick reference cho cách generate và dùng wrappers.
