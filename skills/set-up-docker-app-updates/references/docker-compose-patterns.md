# Set Up Docker App Updates — Docker Compose Rollout Patterns

## Mô hình khuyến nghị mặc định
Với đa số dự án Dockerized, cách dễ hiểu và dễ vận hành nhất là:

1. CI build và publish image mới
2. Máy chạy app kéo image mới
3. Rollout bằng Docker Compose
4. Kiểm tra health/version sau khi lên bản mới

## Pattern 1: Manual update
Phù hợp khi:
- team nhỏ
- môi trường ít server
- muốn kiểm soát rõ từng lần update

Lệnh thường dùng:

```bash
docker compose pull
docker compose up -d
```

Sau đó kiểm tra:
- container có lên lại thành công không
- healthcheck có pass không
- app đang hiển thị đúng version mới không

## Pattern 2: Publish tự động, rollout có người xác nhận
Phù hợp khi:
- muốn build/publish image tự động
- nhưng vẫn muốn con người chủ động bấm rollout

Flow:
- GitHub Actions publish image mới
- Admin hoặc operator chạy job/SSH command để restart service
- Verify sau rollout

Đây thường là điểm cân bằng tốt nhất giữa tự động hoá và an toàn.

## Pattern 3: Watcher-based auto update
Phù hợp khi:
- môi trường đơn giản
- team chấp nhận rủi ro update tự động cao hơn
- đã có healthcheck và rollback story rõ

Không nên coi đây là mặc định cho audience rộng.

## Verification checklist
- `docker compose ps` cho thấy service đang healthy
- logs không có lỗi startup nghiêm trọng
- app trả về đúng version mới
- endpoint chính hoặc UI chính hoạt động bình thường

## Rollback checklist
- Biết image tag cũ cần quay lại
- Có thể pin lại image version trong compose config nếu cần
- Chạy lại `docker compose up -d` với bản ổn định trước đó
- Xác nhận app đã quay về version cũ
