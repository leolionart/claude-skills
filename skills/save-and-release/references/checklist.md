# Save and Release — Checklists

## Trước khi đẩy thay đổi lên remote

Xác nhận các điểm sau:
- `git status` sạch hoặc bạn hiểu rõ mọi file đang thay đổi
- Không có file rác như screenshot debug, log tạm, `.playwright-mcp/`, `.DS_Store`
- Diff đã được review ở mức đủ để giải thích thay đổi
- Nếu máy/repo có `gitleaks` hoặc `gitleak`, đã chạy check hoặc biết rõ vì sao không chạy; mọi warning chỉ để review thủ công, không tự động chặn commit/push
- Test/lint quan trọng đã chạy nếu repo có yêu cầu
- Commit message phản ánh **vì sao** thay đổi tồn tại
- Branch hiện tại là branch đúng để push
- Remote/upstream đúng, đặc biệt nếu branch mới tạo
- Sau khi các điểm trên pass thì push luôn; chỉ dừng nếu xuất hiện bất thường như upstream lạ, divergence, hoặc nhu cầu force push
- Nếu release notes là một phần workflow này, phải xác định rõ phạm vi commit/tag trước khi soạn notes
- Nếu publish release thật là một phần workflow này, phải xác nhận version/tag/gh auth pass trước khi sang bước publish

## Trước khi phát hành

Xác nhận các điểm sau:
- Version phát hành đã rõ, ví dụ `vX.Y.Z`
- File version/metadata đã được bump đúng convention của repo nếu release cần version bump
- Phạm vi phát hành rõ ràng: từ mốc nào đến mốc nào
- Không còn thay đổi local chưa commit ngoài phạm vi release
- Đã kiểm tra commit log trong khoảng release
- Breaking changes đã được đánh dấu rõ nếu có
- Config change, env var mới hoặc bước thủ công đã được ghi chú
- Tag name và commit được gắn tag đã rõ
- Branch và tag đã sẵn sàng để push hoặc đã push đúng remote
- `gh` đã auth và repo đích đúng trước khi chạy `gh release create`
- Nếu có Docker image hoặc artifact khác, cách đặt tag đã rõ
- Release notes đã có ít nhất: Summary, Included changes, Upgrade notes, Validation, và có thể dùng làm body cho GitHub release
- Có kế hoạch verify sau phát hành
- Có đường rollback cơ bản nếu có sự cố

## Dấu hiệu nên dừng lại và hỏi thêm
- Có secrets hoặc file nhạy cảm trong staged changes
- User yêu cầu force push / rewrite history trên shared branch
- Chưa xác định được phạm vi release
- Chưa rõ chiến lược version bump hoặc format tag
- Tag đã tồn tại hoặc không khớp version dự kiến
- `gh` chưa auth hoặc repo đích không đúng
- `gitleaks` / `gitleak` báo secret nghi vấn mà chưa được review
- Release notes đang dựa vào suy đoán thay vì diff/log thực tế
