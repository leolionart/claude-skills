---
name: google-drive
description: Manage Google Drive files via the Google Workspace CLI (gws) — list, upload, download, create, search, and share files. Use when users ask to work with Drive files, organize folders, upload documents, or manage file permissions.
version: 1.0.0
---

# Google Drive — File Management

## Khi nào dùng skill này
- List files/folders trên Drive
- Upload files (binary, documents, media)
- Tạo folders và files mới
- Tìm kiếm files theo tên, type, hoặc content
- Quản lý permissions (share, revoke)
- Thông báo file mới vào Google Chat

## Yêu cầu
- `gws` CLI đã cài và đã xác thực
- Scope OAuth: `https://www.googleapis.com/auth/drive`
- Chỉ đọc: `https://www.googleapis.com/auth/drive.readonly`

## Commands

### List Files
```bash
# List files gần đây
gws drive files list

# List với tùy chọn
gws drive files list \
  --params '{"pageSize": 20, "orderBy": "modifiedTime desc"}'

# Lọc theo loại file
gws drive files list \
  --params '{"q": "mimeType='\''application/vnd.google-apps.spreadsheet'\''", "pageSize": 10}'

# List trong folder cụ thể
gws drive files list \
  --params '{"q": "'\''FOLDER_ID'\'' in parents", "pageSize": 50}'

# Tất cả files (pagination)
gws drive files list \
  --params '{"pageSize": 100}' \
  --page-all
```

### Tìm kiếm Files
```bash
# Tìm theo tên
gws drive files list \
  --params '{"q": "name contains '\''report'\'' and trashed=false"}'

# Tìm files được chia sẻ gần đây
gws drive files list \
  --params '{"q": "sharedWithMe=true", "orderBy": "sharedWithMeTime desc"}'

# Tìm files được chỉnh sửa gần đây (7 ngày)
gws drive files list \
  --params '{"q": "modifiedTime > '\''2024-01-08T00:00:00'\''", "orderBy": "modifiedTime desc"}'
```

### Upload Files
```bash
# Upload đơn giản với tự động metadata
gws drive +upload ./report.pdf

# Upload với metadata tùy chỉnh
gws drive files create \
  --json '{"name": "Q1 Report 2024", "parents": ["FOLDER_ID"]}' \
  --upload ./q1-report.pdf

# Upload vào folder cụ thể
gws drive +upload ./data.csv \
  --parent FOLDER_ID

# Upload và convert sang Google Docs format
gws drive files create \
  --json '{"name": "Document", "mimeType": "application/vnd.google-apps.document"}' \
  --upload ./document.docx
```

### Tạo Folders
```bash
# Tạo folder mới
gws drive files create \
  --json '{"name": "Project Alpha", "mimeType": "application/vnd.google-apps.folder"}'

# Tạo folder lồng nhau
gws drive files create \
  --json '{
    "name": "Reports",
    "mimeType": "application/vnd.google-apps.folder",
    "parents": ["PARENT_FOLDER_ID"]
  }'
```

### Lấy File Metadata
```bash
# Chi tiết file
gws drive files get \
  --params '{"fileId": "FILE_ID", "fields": "id,name,mimeType,size,modifiedTime,webViewLink"}'

# Chỉ lấy link chia sẻ
gws drive files get \
  --params '{"fileId": "FILE_ID", "fields": "webViewLink,webContentLink"}' | jq '.webViewLink'
```

### Quản lý Permissions (Share)
```bash
# Chia sẻ với user cụ thể (editor)
gws drive permissions create \
  --params '{"fileId": "FILE_ID"}' \
  --json '{"type": "user", "role": "writer", "emailAddress": "colleague@company.com"}'

# Chia sẻ với tất cả (viewer, có link)
gws drive permissions create \
  --params '{"fileId": "FILE_ID"}' \
  --json '{"type": "anyone", "role": "reader"}'

# Xem danh sách permissions
gws drive permissions list \
  --params '{"fileId": "FILE_ID"}'

# Xóa permission
gws drive permissions delete \
  --params '{"fileId": "FILE_ID", "permissionId": "PERMISSION_ID"}'
```

### Thông báo File vào Chat
```bash
# Kết hợp Drive + Chat: upload file và thông báo
gws workflow +file-announce \
  --file FILE_ID \
  --space SPACE_NAME
```

### Schema Reference
```bash
gws schema drive.files.list
gws schema drive.files.create
gws schema drive.files.get
gws schema drive.permissions.create
```

## MIME Types Thường Dùng

| Loại | MIME Type |
|------|-----------|
| Google Docs | `application/vnd.google-apps.document` |
| Google Sheets | `application/vnd.google-apps.spreadsheet` |
| Google Slides | `application/vnd.google-apps.presentation` |
| Google Forms | `application/vnd.google-apps.form` |
| Folder | `application/vnd.google-apps.folder` |
| PDF | `application/pdf` |
| CSV | `text/csv` |
| Excel | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |

## Query Language (Drive Search)

```bash
# Các operators hữu ích trong --params q="..."
name contains 'keyword'           # Tìm theo tên
fullText contains 'keyword'       # Tìm trong nội dung
mimeType = 'type'                 # Lọc theo loại
'folder_id' in parents            # Trong folder cụ thể
trashed = false                   # Không bị xóa
starred = true                    # Đã đánh dấu sao
sharedWithMe = true               # Được chia sẻ với mình
modifiedTime > '2024-01-01'       # Sau ngày cụ thể
owners in 'user@domain.com'       # Của user cụ thể
```

## Workflow Decision Tree

```
User muốn tìm file?
  → Hỏi: từ khóa, loại file (nếu có)
  → Dùng: gws drive files list --params '{"q": "name contains '...'"}'

User muốn upload file?
  → Hỏi: đường dẫn file local, folder đích (nếu có)
  → Dùng: gws drive +upload ./file.ext

User muốn chia sẻ file?
  → Hỏi: file ID hoặc tên file, email người nhận, quyền (reader/writer/owner)
  → Tìm file ID nếu chưa có → gws drive files list
  → Dùng: gws drive permissions create

User muốn tạo folder?
  → Hỏi: tên folder, folder cha (nếu có)
  → Dùng: gws drive files create với mimeType folder
```

## Output Standards

- List files: hiển thị bảng với `name`, `type`, `modified`, `size`, `id`
- Upload thành công: hiển thị file ID + webViewLink
- Share thành công: xác nhận với permission ID + role
- Với kết quả nhiều files: mặc định top 10, hỏi nếu user cần thêm

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|------------|-----------|
| "File not found" | File ID sai hoặc không có quyền | Kiểm tra ID, xem quyền truy cập |
| "Insufficient permissions" | Thiếu scope Drive | Thêm scope `drive` trong OAuth |
| "Upload limit exceeded" | File quá lớn | Dùng resumable upload hoặc chia nhỏ |
| "Cannot share" | Domain policy hạn chế | Liên hệ admin workspace |

## Bảo mật

- Không tự động share files với `anyone` trừ khi user yêu cầu rõ ràng
- Kiểm tra nội dung file trước khi upload chứa thông tin nhạy cảm
- Luôn xác nhận trước khi thay đổi permissions của file production
- Với folder chứa data quan trọng: log audit permission changes
