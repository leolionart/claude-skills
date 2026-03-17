# Raindrop.io Skill for Clawdbot

Skill này cho phép Clawdbot tương tác với tài khoản Raindrop.io của bạn để tìm kiếm, quản lý bộ sưu tập và lưu trữ bookmarks.

## 1. Cấu hình (Configuration)

Để sử dụng Skill này, bạn cần có Test Token từ Raindrop.io:
1. Truy cập [Raindrop App Management](https://app.raindrop.io/settings/integrations).
2. Tạo một ứng dụng mới (ví dụ: "Clawdbot Integration").
3. Nhấp vào ứng dụng vừa tạo và copy Test Token.
4. Cấu hình biến môi trường trong file .env của Clawdbot hoặc export trực tiếp:
   `export RAINDROP_TOKEN='your_test_token_here'`

## 2. Cách dùng (Usage)

Skill cung cấp script CLI `raindrop-cli.js`.

### Tìm kiếm Bookmark
`node scripts/raindrop-cli.js search "keyword"`

# Tìm kiếm trong collection cụ thể
`node scripts/raindrop-cli.js search "keyword" --collection "Tên Collection"`

### Quản lý Collection
# Liệt kê các collection
`node scripts/raindrop-cli.js collections list`

# Tạo collection mới
`node scripts/raindrop-cli.js collections create "Tên Mới"`

### Quản lý Tags
# Liệt kê tất cả các tags đang dùng
`node scripts/raindrop-cli.js tags`

### Thêm Bookmark mới
`node scripts/raindrop-cli.js add "https://example.com" --title "Tiêu đề" --collection "Tên Collection" --tags "tag1, tag2"`
