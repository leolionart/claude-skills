# Set Up macOS App Updates — Notes

Skill này tập trung vào **macOS in-app update**.

Nếu dự án của bạn thực ra là **ứng dụng chạy bằng Docker / Docker Compose**, hãy dùng skill:
- `set-up-docker-app-updates`

## Vì sao file này vẫn tồn tại
Repo đang theo pattern mỗi skill có bộ `references/` riêng. File này giữ vai trò chỉ đường để user không nhầm giữa:
- setup update cho **app macOS cài trên máy người dùng**, và
- setup update cho **app Docker chạy trên server/VM/homelab**

## Khi nào nên chuyển sang skill Docker
- Bạn deploy bằng `docker compose up -d`
- Bạn publish Docker image lên GHCR hoặc registry khác
- Bạn muốn server kéo image mới rồi restart service
