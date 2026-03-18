# Save and Release — Checklists

## Trước khi đẩy thay đổi lên remote

Xác nhận các điểm sau:
- `git status` sạch hoặc bạn hiểu rõ mọi file đang thay đổi
- Không có file rác như screenshot debug, log tạm, `.playwright-mcp/`, `.DS_Store`
- Diff đã được review ở mức đủ để giải thích thay đổi
- Test/lint quan trọng đã chạy nếu repo có yêu cầu
- Commit message phản ánh **vì sao** thay đổi tồn tại
- Branch hiện tại là branch đúng để push
- Remote/upstream đúng, đặc biệt nếu branch mới tạo

## Trước khi phát hành

Xác nhận các điểm sau:
- Phạm vi phát hành rõ ràng: từ mốc nào đến mốc nào
- Không còn thay đổi local chưa commit ngoài phạm vi release
- Đã kiểm tra commit log trong khoảng release
- Breaking changes đã được đánh dấu rõ nếu có
- Config change, env var mới hoặc bước thủ công đã được ghi chú
- Nếu có Docker image hoặc artifact khác, cách đặt tag đã rõ
- Có kế hoạch verify sau phát hành
- Có đường rollback cơ bản nếu có sự cố
- Release notes đã có ít nhất: Summary, Included changes, Upgrade notes, Validation

## Dấu hiệu nên dừng lại và hỏi thêm
- Có secrets hoặc file nhạy cảm trong staged changes
- User yêu cầu force push / rewrite history trên shared branch
- Chưa xác định được phạm vi release
- Release notes đang dựa vào suy đoán thay vì diff/log thực tế
