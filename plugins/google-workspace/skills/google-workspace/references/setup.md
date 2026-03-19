# Google Workspace CLI — Setup & Auth Guide

## Cài đặt CLI

```bash
npm install -g @googleworkspace/cli
# hoặc
brew install googleworkspace-cli
```

## Tạo OAuth Credentials (Google Cloud Console)

1. Truy cập https://console.cloud.google.com/
2. Chọn project (hoặc tạo project mới)
3. **APIs & Services** → **Enabled APIs** → bật các API cần:
   - Gmail API
   - Google Drive API
   - Google Sheets API
   - Google Docs API
   - Google Calendar API
   - Google Chat API
4. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Application type: **Desktop app**
6. Download JSON → đặt tên `client_secret.json`

## Các loại OAuth Scopes theo sản phẩm

| Sản phẩm | Scope |
|----------|-------|
| Gmail (full) | `https://mail.google.com/` |
| Gmail (chỉ đọc) | `https://www.googleapis.com/auth/gmail.readonly` |
| Drive (full) | `https://www.googleapis.com/auth/drive` |
| Drive (chỉ đọc) | `https://www.googleapis.com/auth/drive.readonly` |
| Sheets (full) | `https://www.googleapis.com/auth/spreadsheets` |
| Sheets (chỉ đọc) | `https://www.googleapis.com/auth/spreadsheets.readonly` |
| Docs | `https://www.googleapis.com/auth/documents` |
| Calendar | `https://www.googleapis.com/auth/calendar` |
| Chat | `https://www.googleapis.com/auth/chat.messages` |

## Interactive OAuth Setup

```bash
# Bước 1: Nhập Client ID và Secret
gws auth setup

# Bước 2: Login và chọn scopes
gws auth login

# Bước 3: Xác nhận hoạt động
gws drive files list --params '{"pageSize": 3}'
```

## Service Account (CI/CD, automation)

```bash
# 1. Tạo Service Account trong GCP Console
# 2. Download JSON key
# 3. Set env var
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE=/path/to/service-account.json

# 4. Với Drive/Sheets: phải share files với service account email
# vd: projectname@project-id.iam.gserviceaccount.com
```

## Lỗi thường gặp

### "Access blocked: gws has not completed the Google verification process"
- **Nguyên nhân**: OAuth app ở trạng thái "testing"
- **Cách xử lý**: Thêm email của bạn vào test users trong OAuth consent screen

### "This app isn't verified"
- **Nguyên nhân**: App chưa publish hoặc chưa verify
- **Cách xử lý**: Click "Advanced" → "Go to [app] (unsafe)" để dùng trong development

### "insufficient_scope"
- **Nguyên nhân**: Token không có scope cần thiết
- **Cách xử lý**: `gws auth login` lại và chọn đúng scopes

### Discovery cache stale
```bash
# Xóa cache nếu gặp lỗi "Discovery error" (exit code 4)
rm -rf ~/.config/gws/discovery-cache/
```

## Kiểm tra Auth nhanh

```bash
# Test Drive access
gws drive files list --params '{"pageSize": 1}'

# Test Gmail access
gws gmail +triage

# Test Sheets access (cần spreadsheet ID)
gws sheets spreadsheets get --params '{"spreadsheetId": "SHEET_ID"}'
```
