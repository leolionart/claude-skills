---
name: google-workspace
description: Configure and use the Google Workspace CLI (gws) for cross-product workflows — standup reports, meeting prep, weekly digests, and email-to-task pipelines across Gmail, Drive, Sheets, Docs, Calendar, and Chat.
version: 1.0.0
---

# Google Workspace CLI — Auth & Cross-Product Workflows

## Tổng quan
`gws` là CLI thống nhất cho toàn bộ Google Workspace. Dùng skill này khi:
- Cài đặt / xác thực lần đầu
- Chạy các workflow tổng hợp nhiều sản phẩm (standup, meeting prep, weekly digest)
- Kiểm tra schema API hoặc debug lỗi auth

Với các tác vụ đơn sản phẩm (Gmail, Drive, Sheets), dùng skill chuyên biệt: `gws-gmail`, `gws-drive`, `gws-sheets`.

## Cài đặt

```bash
# npm (yêu cầu Node.js 18+)
npm install -g @googleworkspace/cli

# Homebrew
brew install googleworkspace-cli

# Kiểm tra cài đặt
gws --version
```

## Xác thực (Authentication)

### Ưu tiên kiểm tra theo thứ tự sau:
1. **Env var token** — nhanh nhất, phù hợp CI/CD
2. **Credentials file** — service account hoặc OAuth JSON
3. **Encrypted local** — sau khi `gws auth login`
4. **Plaintext config** — fallback

### Workflow xác thực Interactive OAuth:
```bash
gws auth setup          # Nhập Client ID + Secret
gws auth login          # Mở browser, chọn Google account
gws auth export         # Xuất credentials để backup
```

### Xác thực Service Account (CI/CD):
```bash
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE=/path/to/service-account.json
gws drive files list    # Test ngay
```

### Biến môi trường quan trọng:
| Biến | Mục đích |
|------|---------|
| `GOOGLE_WORKSPACE_CLI_TOKEN` | Access token trực tiếp |
| `GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE` | Đường dẫn credentials JSON |
| `GOOGLE_WORKSPACE_CLI_CLIENT_ID` | OAuth Client ID |
| `GOOGLE_WORKSPACE_CLI_CLIENT_SECRET` | OAuth Client Secret |
| `GOOGLE_WORKSPACE_CLI_CONFIG_DIR` | Thư mục config (mặc định `~/.config/gws`) |
| `GOOGLE_WORKSPACE_CLI_LOG` | Log level (debug, info, warn, error) |
| `GOOGLE_WORKSPACE_CLI_PROJECT_ID` | GCP Project ID |

## Workflow Commands (+prefix)

### Standup Report
```bash
# Tổng hợp email + calendar + tasks cho báo cáo standup hàng ngày
gws workflow +standup-report
```

### Meeting Preparation
```bash
# Tổng hợp agenda, tài liệu liên quan, lịch họp
gws workflow +meeting-prep
```

### Weekly Digest
```bash
# Tóm tắt tuần: email quan trọng, files mới, events đã tham gia
gws workflow +weekly-digest
```

### Email → Task
```bash
# Chuyển email thành task (kết hợp Gmail + Tasks/Chat)
gws workflow +email-to-task
```

### File Announcement
```bash
# Thông báo file mới vào Google Chat space
gws workflow +file-announce
```

## Khám phá Schema API

```bash
# Xem request/response schema của bất kỳ API method nào
gws schema drive.files.list
gws schema gmail.users.messages.send
gws schema sheets.spreadsheets.values.get
gws schema calendar.events.insert
```

## Dry-run & Debugging

```bash
# Xem request sẽ được gửi mà không thực thi
gws gmail +send --to test@example.com --subject "Test" --body "Hello" --dry-run

# Bật debug log
GOOGLE_WORKSPACE_CLI_LOG=debug gws drive files list

# Pagination toàn bộ kết quả
gws drive files list --params '{"pageSize": 100}' --page-all
```

## Exit Codes
| Code | Ý nghĩa |
|------|---------|
| `0` | Thành công |
| `1` | API error |
| `2` | Auth error — kiểm tra credentials |
| `3` | Validation error — sai params |
| `4` | Discovery error — không lấy được API schema |
| `5` | Internal error |

## Quy trình xử lý lỗi

- **Exit code 2**: Kiểm tra `GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE` hoặc chạy lại `gws auth login`
- **Exit code 4**: Tạm thời xóa cache `~/.config/gws/discovery-cache/` rồi thử lại
- **Thiếu permission**: Vào Google Cloud Console → OAuth consent screen → thêm scope cần thiết

## Bảo mật

- Credentials được mã hoá AES-256-GCM, key lưu trong OS keyring hoặc `~/.config/gws/.encryption_key`
- **KHÔNG** commit credentials JSON vào repo
- **KHÔNG** in giá trị token/secret ra output hoặc log
- Khi chia sẻ config: chỉ chia sẻ template (key rỗng), không chia sẻ values

## Resources
- `references/setup.md` — Hướng dẫn cấp quyền OAuth chi tiết + lỗi thường gặp
- CLI repo: https://github.com/googleworkspace/cli
