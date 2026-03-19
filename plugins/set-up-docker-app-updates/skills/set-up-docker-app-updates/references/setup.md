# Set Up Docker App Updates — Setup Guide

## Mục tiêu setup
Bạn cần chuẩn bị đủ các phần sau để app Docker có thể phát hành version mới một cách ổn định:

1. Một image name rõ ràng, ví dụ `ghcr.io/<owner>/<repo>`
2. Một workflow build/publish có thể chạy lặp lại
3. Một chiến lược tag để biết image nào tương ứng version nào
4. Một cách rollout bản mới ở môi trường chạy app

## Thiết lập tối thiểu

### 1) Chọn nơi publish image
Khuyến nghị mặc định:
- **GHCR** (`ghcr.io`) nếu code đang ở GitHub

Lý do:
- Dễ map với repo GitHub
- Hỗ trợ permissions rõ ràng cho GitHub Actions
- Dễ dùng cùng git tags / GitHub Releases

### 2) Chọn thời điểm build image
Có 2 mô hình phổ biến:

- **Build on `main`**
  - Mỗi merge vào `main` tạo image mới
  - Phù hợp để có bản mới nhất cho staging/internal use

- **Build on tag**
  - Chỉ khi tạo tag như `v1.2.3` mới publish image release
  - Phù hợp nếu bạn muốn release có kiểm soát hơn

Khuyến nghị thực dụng:
- Dùng cả hai nếu team cần vừa có build liên tục, vừa có release rõ version

### 3) Quyền GitHub Actions cần có
Thông thường workflow publish image lên GHCR cần:

```yaml
permissions:
  contents: read
  packages: write
```

Nếu tạo release notes hoặc release artifact qua GitHub API, có thể cần thêm:

```yaml
permissions:
  contents: write
```

### 4) Secrets và biến cấu hình
Ưu tiên dùng `GITHUB_TOKEN` mặc định nếu publish lên GHCR trong cùng repo.

Chỉ dùng PAT khi:
- publish cross-repo/cross-org
- policy nội bộ không cho dùng token mặc định

Không hardcode secrets trong YAML.

## Thiết lập rollout cơ bản

### Nếu deploy bằng Docker Compose
Luồng đơn giản nhất:
1. Publish image mới
2. SSH vào máy chạy app hoặc trigger job admin
3. Chạy:

```bash
docker compose pull
docker compose up -d
```

4. Verify healthcheck / logs / version đang chạy

## Khuyến nghị mặc định cho audience rộng
Nếu người dùng không có yêu cầu đặc biệt:
- Publish lên GHCR
- Build trên `main` và trên tag release
- Rollout bằng Docker Compose thủ công hoặc admin-triggered
- Tránh auto-update watcher ở vòng đầu
