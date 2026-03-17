---
name: gws-sheets
description: Read, write, and manage Google Sheets via the Google Workspace CLI (gws). Use when users ask to read spreadsheet data, append rows, create new sheets, or automate data pipelines with Google Sheets as source/destination.
version: 1.0.0
---

# GWS Sheets — Spreadsheet Operations

## Khi nào dùng skill này
- Đọc dữ liệu từ Google Sheets (specific range hoặc toàn sheet)
- Append / ghi dữ liệu mới vào sheet
- Tạo spreadsheet mới
- Dùng Sheets làm data store cho automation pipeline
- Export/import dữ liệu CSV ↔ Sheets

## Yêu cầu
- `gws` CLI đã cài và đã xác thực
- Scope OAuth: `https://www.googleapis.com/auth/spreadsheets`
- Hoặc chỉ đọc: `https://www.googleapis.com/auth/spreadsheets.readonly`
- Python 3.8+ nếu dùng `scripts/sheets_helper.py`

## Commands

### Đọc Dữ liệu
```bash
# Đọc range cụ thể
gws sheets spreadsheets values get \
  --params '{"spreadsheetId": "SHEET_ID", "range": "Sheet1!A1:D10"}'

# Dùng helper command (đơn giản hơn)
gws sheets +read \
  --spreadsheet-id SHEET_ID \
  --range "Sheet1!A1:D10"

# Đọc toàn bộ sheet
gws sheets +read \
  --spreadsheet-id SHEET_ID \
  --range "Sheet1"

# Parse kết quả với jq
gws sheets +read \
  --spreadsheet-id SHEET_ID \
  --range "Sheet1!A:C" | jq '.values[]'
```

### Ghi Dữ liệu (Append)
```bash
# Append 1 hàng
gws sheets +append \
  --spreadsheet-id SHEET_ID \
  --range "Sheet1!A:A" \
  --values '[["2024-01-15", "Alice", "Completed", 150]]'

# Append nhiều hàng
gws sheets spreadsheets values append \
  --params '{"spreadsheetId": "SHEET_ID", "range": "Sheet1!A:A", "valueInputOption": "USER_ENTERED"}' \
  --json '{
    "values": [
      ["2024-01-15", "Alice", "Task A", "Done"],
      ["2024-01-15", "Bob", "Task B", "In Progress"]
    ]
  }'
```

### Cập nhật Dữ liệu (Update)
```bash
# Update range cụ thể
gws sheets spreadsheets values update \
  --params '{"spreadsheetId": "SHEET_ID", "range": "Sheet1!B2", "valueInputOption": "USER_ENTERED"}' \
  --json '{"values": [["New Value"]]}'

# Update nhiều cells
gws sheets spreadsheets values batchUpdate \
  --params '{"spreadsheetId": "SHEET_ID"}' \
  --json '{
    "valueInputOption": "USER_ENTERED",
    "data": [
      {"range": "Sheet1!A1", "values": [["Header 1"]]},
      {"range": "Sheet1!B1", "values": [["Header 2"]]}
    ]
  }'
```

### Tạo Spreadsheet Mới
```bash
# Tạo spreadsheet trống
gws sheets spreadsheets create \
  --json '{"properties": {"title": "Tên Spreadsheet"}}'

# Tạo với multiple sheets
gws sheets spreadsheets create \
  --json '{
    "properties": {"title": "Project Tracker"},
    "sheets": [
      {"properties": {"title": "Tasks"}},
      {"properties": {"title": "Summary"}},
      {"properties": {"title": "Archive"}}
    ]
  }'
```

### Lấy Metadata Spreadsheet
```bash
# Xem thông tin spreadsheet (title, sheets list, permissions)
gws sheets spreadsheets get \
  --params '{"spreadsheetId": "SHEET_ID"}'

# Chỉ xem danh sách sheet tabs
gws sheets spreadsheets get \
  --params '{"spreadsheetId": "SHEET_ID"}' | jq '.sheets[].properties | {title, sheetId}'
```

### Schema Reference
```bash
gws schema sheets.spreadsheets.values.get
gws schema sheets.spreadsheets.values.append
gws schema sheets.spreadsheets.values.update
gws schema sheets.spreadsheets.create
```

## Workflow Decision Tree

```
User muốn đọc dữ liệu?
  → Hỏi: spreadsheet_id (từ URL), range (vd: "Sheet1!A1:D10")
  → Dùng: gws sheets +read
  → Nếu không biết range: lấy metadata trước để xem sheet names

User muốn thêm dữ liệu?
  → Hỏi: spreadsheet_id, range (sheet tab + cột bắt đầu), data
  → Dùng: gws sheets +append
  → valueInputOption: USER_ENTERED (tự convert types) hoặc RAW (giữ nguyên string)

User muốn tạo sheet mới?
  → Hỏi: tên spreadsheet, danh sách sheet tabs (nếu có)
  → Dùng: gws sheets spreadsheets create
  → Sau đó lưu spreadsheet_id từ response để user biết

User muốn import từ CSV?
  → Dùng scripts/sheets_helper.py --import-csv
```

## Helper Script

Dùng `scripts/sheets_helper.py` cho các tác vụ phức tạp:

```bash
# Đọc và hiển thị dạng table đẹp
python3 skills/gws-sheets/scripts/sheets_helper.py read \
  --sheet-id SHEET_ID \
  --range "Sheet1!A1:E20"

# Import CSV vào Sheets
python3 skills/gws-sheets/scripts/sheets_helper.py import-csv \
  --sheet-id SHEET_ID \
  --range "Sheet1!A1" \
  --file data.csv

# Export Sheets ra CSV
python3 skills/gws-sheets/scripts/sheets_helper.py export-csv \
  --sheet-id SHEET_ID \
  --range "Sheet1" \
  --output output.csv
```

## Lấy Spreadsheet ID

Spreadsheet ID nằm trong URL:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
```

Ví dụ URL:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
→ SHEET_ID = 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

## Output Standards

- Mặc định hiển thị dữ liệu dạng markdown table (không quá 20 hàng)
- Với dữ liệu lớn: hiển thị preview 5 hàng đầu + tổng số rows/columns
- Ghi thành công: xác nhận với updatedRange và updatedRows
- Luôn hiển thị spreadsheet URL sau khi tạo mới để user bookmark

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|------------|-----------|
| "Spreadsheet not found" | ID sai hoặc không có quyền | Kiểm tra ID từ URL, share với service account |
| "Range not found" | Sheet tab name sai | Dùng `spreadsheets get` để xem danh sách sheets |
| "Unable to parse range" | Format range sai | Format chuẩn: `SheetName!A1:D10` |
| Exit 2 | Auth lỗi | Kiểm tra scope `spreadsheets` trong OAuth |

## Bảo mật

- Không log data chứa PII (tên, email, số điện thoại khách hàng)
- Với sheets chứa financial data: luôn xác nhận range trước khi update
- Không tự động overwrite data — dùng append thay vì update khi có thể
