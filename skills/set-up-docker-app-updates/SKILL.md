---
name: set-up-docker-app-updates
description: Set up the pieces your Docker app needs so new versions can be built, published, and rolled out safely.
version: 1.0.0
---

# Set Up Docker App Updates

## Overview
Dùng skill này khi bạn muốn **thiết lập một lần** để ứng dụng chạy bằng Docker có thể phát hành version mới và cập nhật theo quy trình ổn định.

Skill này tập trung vào 3 việc:
- Thiết lập quy trình build/publish image, thường qua GitHub Actions
- Chuẩn hoá cách gắn tag version cho image
- Hướng dẫn rollout bản mới bằng Docker Compose theo cách dễ vận hành

Đây là skill setup nền tảng cho dự án. Sau khi đã thiết lập xong, bạn thường không cần gọi lại thường xuyên.

## Khi nào dùng skill này
- Bạn muốn app Docker có quy trình publish image rõ ràng
- Bạn muốn dùng GitHub Actions để build và đẩy image lên registry như GHCR
- Bạn muốn đội vận hành update app bằng `docker compose pull && docker compose up -d`
- Bạn muốn chuẩn bị sẵn nền tảng để app có thể kiểm tra version mới

## Inputs required
- Repo đang dùng GitHub hay nền tảng git nào
- Docker image sẽ publish lên đâu, ví dụ GHCR
- Cách bạn muốn phát hành: build trên `main`, build theo tag, hoặc cả hai
- Mô hình deploy hiện tại: Docker Compose, VM, homelab, VPS, v.v.

## Workflow / Decision tree
1. **Set up publishing**
   - Xác định registry đích và naming convention
   - Tạo workflow GitHub Actions tham khảo
   - Thiết lập quyền cần thiết để publish image

2. **Choose a tagging strategy**
   - Quyết định dùng `main`, `sha-<shortsha>`, `vX.Y.Z`, `latest`
   - Mapping git tag và release sang image tag

3. **Choose an update path**
   - Manual rollout qua Docker Compose
   - Semi-automated publish + admin-triggered restart
   - Watcher-based auto update nếu thật sự cần

4. **Add version visibility**
   - Hiển thị current version trong app hoặc admin UI
   - Có endpoint/metadata để biết version mới nhất đã publish

## Output standards
- Giải thích setup theo từng bước, không giả định người đọc quá rành Docker
- Nếu đưa YAML/template: nói rõ phần nào cần thay bằng giá trị của dự án
- Luôn chốt bằng khuyến nghị rollout mặc định an toàn nhất cho audience rộng

## Failure modes / lỗi thường gặp
- Thiếu quyền `packages: write` nên publish image thất bại
- Tag strategy không rõ khiến khó rollback hoặc khó trace image
- Dùng `latest` làm tag duy nhất nên khó biết chính xác đang chạy build nào
- Deploy flow không nói rõ ai/điều gì kích hoạt rollout

## Safety notes
- Không coi auto-update watcher là mặc định nếu chưa có nhu cầu rõ
- Không ghi secrets trực tiếp vào workflow YAML
- Không biến repo hiện tại thành demo app deployable nếu mục tiêu chỉ là chia sẻ pattern
- Ưu tiên rollout có thể verify và rollback được

## Resources
- `references/setup.md` — Những thành phần cần có để publish image
- `references/github-actions-template.md` — Workflow YAML mẫu
- `references/tagging-strategy.md` — Cách đặt tag image dễ hiểu
- `references/docker-compose-patterns.md` — Các cách rollout bản mới bằng Docker Compose
