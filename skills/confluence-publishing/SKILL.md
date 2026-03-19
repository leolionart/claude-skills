---
name: confluence-publishing
description: Publish markdown deliverables to Confluence with compliant formatting, metadata syncing, and automation hooks. Use when the user wants to publish a document to Confluence, update an existing Confluence page, sync local markdown to Confluence, or mentions push to Confluence, đăng lên Confluence, or cập nhật trang Confluence.
version: 1.1.0
category: delivery
updated: 2026-03-19
changelog: Added wiki format decision tree and bullet list rendering fix
---

# Confluence Publishing Skill

> ⚠️ **CRITICAL**: All Confluence operations MUST use the bundled Confluence CLI wrapper. Never use web fetch tools or raw curl for authenticated Confluence work. Always use `scripts/confluence-mcp confluence-*` commands for reading, updating, searching, or any Confluence interaction.

## Purpose
- Enforce the canonical workflow for turning repository Markdown into production-ready Confluence pages.
- Guard against metadata drift, broken checklists, and incorrect parent-page targeting.
- When harvesting content from Confluence pages (via CLI) that contain images/attachments, download all images/attachments locally alongside the markdown mirror and update links to the local copies to keep offline mirrors complete.

## Role Alignment
- Applies to every agent before invoking `scripts/confluence-mcp confluence-update-page` or `scripts/confluence-mcp confluence-create-page`.

## Execution Mode
- **Bắt buộc ưu tiên sub-agent** khi flow publish có payload lớn vì Confluence responses dễ làm đầy context window.
- **Ưu tiên** agent Confluence chuyên biệt nếu runtime của bạn có.
- **Fallback**: nếu không có agent riêng, delegate sang agent tổng quát và nhúng workflow bên dưới vào prompt.
- **Ngoại lệ**: Chỉ nên gọi CLI trực tiếp khi thao tác đơn lẻ (đọc 1 page hoặc update 1 field). Khi flow bao gồm prepare + convert + publish + post-publish, vẫn nên delegate.

## Prerequisites
- **CLI Availability**: Ensure `scripts/confluence-mcp` is present and executable (run `./scripts/generate_atlassian_clis.sh` if missing).
- Update `updated_at` in the source document and keep `created_at` unchanged.
- Confirm the destination page/space/parent target using whatever mapping document your repo uses.
- If mirroring an existing Confluence page locally, create an `assets/` (or `media/`) folder adjacent to the markdown file and plan to store all images/attachments there.

## Bundled CLI Files
- `.mcp.json` — local MCP definition with env placeholders (`JIRA_URL`, `JIRA_PERSONAL_TOKEN`, `CONFLUENCE_URL`, `CONFLUENCE_PERSONAL_TOKEN`)
- `scripts/generate_atlassian_clis.sh` — import `mcp-atlassian`, create local config, compile `scripts/mcp-atlassian`, and refresh wrappers
- `scripts/confluence-mcp` — Confluence wrapper with `--output json` compatibility
- `scripts/jira-mcp` — Jira wrapper bundled from the same binary so Atlassian workflows can stay in one package
- `references/atlassian_cli.md` — quick reference for generate/refresh and common usage

## Mermaid Diagrams & Visual Content

### When Your Document Contains Mermaid Diagrams

Mermaid diagrams require special handling for Confluence compatibility. Follow this integrated workflow:

#### 1. Validate Diagram Syntax
Before publishing, ensure your Mermaid diagram follows these standards:

**Diagram Structure:**
- Prefer `flowchart TD` for top-to-bottom flow
- Avoid `subgraph` unless already verified for compatibility
- Use flat layouts with prefixed labels to indicate swimlanes

**Node Naming Rules:**
- Rectangles: `nodeId["Label"]`
- Decisions: `Decision{"Yes/No?"}`
- Start/End: `Start((Start))`, `ProcessEnd((Done))`
- Notes: `note1["Note: ..."]`
- Escape special characters: wrap labels containing `()<>{}:,&"` in quotes
- Avoid reserved IDs like `end`

**Standard Color Palette:**
```mermaid
classDef startNode fill:#90EE90,stroke:#2E7D32,stroke-width:2px
classDef processNode fill:#87CEEB,stroke:#333333,stroke-width:1.5px
classDef decisionNode fill:#FFE4B5,stroke:#B26A00,stroke-width:1.5px
classDef handoffNode fill:#FFF5E1,stroke:#FF8C00,stroke-width:1.5px
classDef externalNode fill:#F5E6FF,stroke:#8E44AD,stroke-width:1.5px
classDef endPositive fill:#B2FFB2,stroke:#2E7D32,stroke-width:2px
classDef endNegative fill:#FFB2B2,stroke:#C62828,stroke-width:2px
```

**Compatibility Rules (Mermaid v9/v11):**
- Avoid unsupported shapes or inline attribute syntaxes that older Confluence Mermaid plugins may reject
- Use `classDef` + `class` for coloring
- Use standard arrows and unquoted edge labels
- Escape HTML-sensitive characters when converting to storage format

#### 2. Wrap for Confluence
Instead of using ad-hoc scripts, ensure your mermaid macro is formatted as:
```xml
<ac:structured-macro ac:name="mermaid-macro">
  <ac:plain-text-body><![CDATA[...diagram...]]></ac:plain-text-body>
</ac:structured-macro>
```

#### 3. Embed and Publish
- Embed the wrapped macro into your document body before publishing
- Use `content_format='storage'` when publishing

### Documents Without Mermaid
If your document contains only text, tasks, and lists, proceed directly to the execution checklist.

## Image Handling in Confluence (storage format)

### External Images — dùng `<ri:url>` trực tiếp (preferred)

Khi cần chèn ảnh từ URL bên ngoài, không cần download rồi upload attachment nếu không có yêu cầu lưu trữ lâu dài:

```xml
<ac:image ac:width="700"><ri:url ri:value="https://example.com/image.jpg"/></ac:image>
```

### Attached Images — chỉ dùng khi cần lưu trữ lâu dài

Chỉ upload ảnh thành attachment khi:
1. Domain nguồn có thể thay đổi URL hoặc chặn hotlink
2. Yêu cầu lưu trữ offline/permanent trong Confluence
3. User yêu cầu rõ ràng

Storage format cho attached image:
```xml
<ac:image ac:width="700"><ri:attachment ri:filename="image.jpg"/></ac:image>
```

## Execution Checklist

### 1. Prepare the Markdown Source
1. Read the newest version of the file from the repo.
2. Refresh metadata:
   - `updated_at` → current date
   - `public_confluence_url` → existing Confluence URL or draft placeholder
   - `published_at` → keep empty before publish, set after successful publish
3. Review the content for placeholder text, broken links, or legacy notes.
4. If the source Confluence page has images/attachments:
   - Use Confluence CLI to list/download attachments
   - Save them under an adjacent `assets/` folder
   - Update markdown links to point to local copies

### 2. Convert Markdown to Confluence-Friendly Content

#### Format Selection Strategy (critical)
Use this decision tree to select the correct format:

```text
Does content have bullet lists?
├─ YES → Use wiki format
│   ├─ Simple bullets → wiki format
│   └─ Nested bullets → wiki format
│
└─ NO → Check other complexity
    ├─ Has tables with line breaks? → wiki format
    ├─ Has complex nested structures? → wiki format
    ├─ Has tasks/checklists/Mermaid? → storage format
    └─ Simple text and headings only? → markdown OK
```

**Known issue**: markdown format with bullet lists often fails to render as proper bullet points in Confluence.

**Solution**: When content contains bullet lists, always use `content_format='wiki'`.

#### Wiki Format Syntax Reference

**Headers:**
- `# Title` → `h1. Title`
- `## Section` → `h2. Section`
- `### Subsection` → `h3. Subsection`

**Text Formatting:**
- `**bold**` → `*bold*`
- `*italic*` → `_italic_`
- `` `code` `` → `{{code}}`

**Lists:**
- `- bullet` → `* bullet`
- nested bullets → `**` / `***`
- numbered lists stay as `#`

**Code Blocks:**
- fenced block → `{code:lang}` ... `{code}`

**Tables:**
- header cells use `||Header||`
- normal cells use `|Cell|`
- line breaks in cells use `\\`

**Links:**
- `[text](url)` → `[text|url]`

#### Content Preparation Steps
- Exclude YAML frontmatter and top-level H1 from the publish payload; the CLI call sets page title explicitly.
- Wrap Mermaid manually if needed.
- Convert bullet lists to wiki syntax when using wiki format.
- Convert checklists to Confluence task macros if possible, otherwise prefer storage format.
- Inline code in storage mode becomes `<code>`.

### 3. Publish via CLI
1. Use `scripts/confluence-mcp confluence-update-page` for existing pages or `scripts/confluence-mcp confluence-create-page` for new pages.
2. Always include `--output json` to keep payload compact and predictable.
3. Ensure `content_format` is set correctly (`wiki` for bullet lists, `storage` for macros/checklists, `markdown` only for simple text).
4. Verify rendering on the destination page.

### 4. Post-Publish Actions
1. Open the Confluence page to verify headings, lists, macros, and tasks render correctly.
2. Update `public_confluence_url` with the live page link and set `published_at`.
3. Commit the local mirror if your workflow requires repository state to match published state.

## Managing Internal Link Mentions (strict)
- Use repo-local link syntax only in metadata/frontmatter if your repo requires it.
- In document body, prefer full Confluence URLs for cross-doc references.
- Remove frontmatter from the publish payload.

## CLI Tooling
- `scripts/confluence-mcp confluence-get-page --page-id "<PAGE_ID>" --output json`
- `scripts/confluence-mcp confluence-update-page --output json`
- `scripts/confluence-mcp confluence-create-page --output json`
- Regenerate binaries: `./scripts/generate_atlassian_clis.sh`

## Quality Gates

### Pre-Publish Validation
- Payload excludes YAML frontmatter and H1 title
- Page `title` parameter is set explicitly
- Format selection is validated:
  - bullet lists → `wiki`
  - nested bullets → `wiki`
  - tasks/checklists/Mermaid → `storage`
  - simple text only → `markdown` acceptable
- Internal links are converted to Confluence URLs or clearly marked as internal-only

### Post-Publish Validation
- Open Confluence page and verify rendering (especially bullet points)
- `public_confluence_url` updated with live page link
- `published_at` updated if your metadata format supports it
- For CLI interactions, prefer `--output json` so responses remain compact and parseable

### Common Errors Reference
**Bullet points render as continuous text**
- Cause: using `content_format='markdown'` with bullet lists
- Fix: switch to `content_format='wiki'` and convert bullets to `*`

**Error calling update page with no details**
- Likely causes: invalid storage HTML, encoding issues, schema violations
- Fix: switch to wiki format or simplify the storage payload

**Nested lists not rendering**
- Cause: markdown nested list syntax not supported
- Fix: use wiki format with `**` and `***`
