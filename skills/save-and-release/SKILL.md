---
name: save-and-release
description: Save work with clear commits, auto-push the branch, and draft release notes by default; only publish tags or GitHub releases when explicitly requested.
version: 1.0.2
---

# Save and Release

## Overview
Dùng skill này khi cần chốt một đợt thay đổi theo flow dễ hiểu: commit sạch, push ngay lên upstream đúng branch, rồi chuẩn bị release notes hoặc checklist phát hành khi cần.

Skill này phù hợp cho 4 nhu cầu phổ biến:
- **Lưu thay đổi** bằng commit message rõ mục đích
- **Đẩy branch lên remote** ngay sau commit nếu không có blocker
- **Soạn release notes** từ diff/log thực tế mà không cần hỏi lại từng bước thường lệ
- **Phát hành GitHub release** chỉ khi user yêu cầu rõ publish/tag

Nếu repo đang dùng plugin `git-sync`, cần phân biệt:
- `git-sync` tự động commit/push qua hooks
- `save-and-release` là workflow chủ động để review kỹ trước khi gửi thay đổi hoặc chuẩn bị phát hành

## Khi nào dùng skill này
- Bạn muốn “lưu thay đổi” thành commit sạch
- Bạn muốn save + push liền sau khi review local changes
- Bạn muốn soạn release notes hoặc checklist trước khi phát hành
- Bạn muốn đi tiếp tới GitHub release sau khi đã yêu cầu rõ việc publish
- Bạn muốn một quy trình an toàn, dễ giải thích cho người khác review

## Inputs required
- Trạng thái local changes và commit log gần đây
- Branch hiện tại và target remote/upstream
- Nếu có release notes: phạm vi thay đổi, mốc commit/tag, và đối tượng đọc notes
- Nếu có publish release: version dự kiến, format tag, trạng thái `gh` auth, và repo đích
- Nếu repo có convention đặc biệt cho version bump hoặc notes, phải đọc ra trước khi thực hiện

## Workflow / Decision tree
1. **Save**
   - Kiểm tra thay đổi local
   - Nếu máy/repo có `gitleaks` hoặc `gitleak`, chạy check để rà secret nghi vấn
   - Review diff và cảnh báo nếu `gitleaks` báo nghi vấn
   - Tạo commit message ngắn, rõ mục đích

2. **Push**
   - Kiểm tra branch tracking / remote state
   - Push branch ngay sau commit; không hỏi lại chỉ để xác nhận push thường lên upstream đúng branch
   - Chỉ dừng để hỏi thêm nếu push trở thành hành động rủi ro hơn phạm vi này, ví dụ force push, remote/repo bất ngờ, hoặc trạng thái upstream mâu thuẫn

3. **Prepare release notes**
   - Xác định phạm vi thay đổi của đợt phát hành hoặc handoff
   - Chạy checklist trước khi phát hành nếu notes sẽ dùng cho release
   - Đọc commit log và diff trong đúng phạm vi
   - Soạn release notes draft dễ scan, có thể dùng lại cho GitHub release hoặc changelog nội bộ
   - Không hỏi lại chỉ để xác nhận bước soạn notes thường nếu user đã gọi skill này cho flow save/push/release notes

4. **Execute GitHub release**
   - Chỉ làm bước này khi user đã yêu cầu rõ việc publish
   - Bump version theo convention của repo và tạo commit tương ứng nếu cần
   - Tạo tag cho version mới và push tag lên remote
   - Tạo GitHub release bằng `gh release create` với release notes đã review
   - Dừng lại nếu thiếu version/tag, `gh` chưa auth, repo đích không đúng, tag conflict, hoặc cần hành động rủi ro hơn phạm vi thường

## Output standards
- Nếu lưu thay đổi: trả về commit hash ngắn + ý nghĩa commit
- Nếu push: nêu branch/remote đã push
- Nếu chuẩn bị release notes: nêu rõ phạm vi, checklist pass/fail, và bản notes markdown
- Nếu tạo GitHub release: trả về version, tag, và release URL hoặc lỗi cần xử lý

## Failure modes / lỗi thường gặp
- Còn file rác hoặc file chưa review trong working tree
- Branch chưa tracking remote
- Hook fail nên commit chưa tạo thành công
- `gitleaks` hoặc `gitleak` cảnh báo secret nghi vấn cần review thủ công
- Chưa xác định được phạm vi change log hoặc release notes
- Version bump chưa rõ hoặc tag không khớp version
- Tag đã tồn tại hoặc remote tag conflict
- `gh` chưa auth hoặc repo đích không đúng

## Safety notes
- Không force push nếu chưa có user approval rõ ràng
- Không bỏ qua hooks bằng `--no-verify` trừ khi user yêu cầu rõ
- `gitleaks` / `gitleak` chỉ là bước cảnh báo/advisory; không tự động chặn commit hoặc push
- Khi user gọi skill này cho luồng save hoặc save+push, coi commit thường và push thường lên upstream đúng branch là đã được chấp thuận trong cùng workflow
- Khi user yêu cầu chuẩn bị release notes, coi việc soạn notes từ diff/log thực tế là đã được chấp thuận trong cùng workflow
- Không tạo/push tag hoặc chạy `gh release create` nếu user chưa xác nhận rõ việc publish
- Vẫn phải dừng lại nếu remote/upstream bất ngờ, push bị từ chối do divergence, cần force push, có secrets nghi vấn chưa review, hoặc checklist phát hành còn blocker
- Không commit secrets, `.env`, credentials, screenshot debug hay `.playwright-mcp/`

## Resources
- `references/checklist.md` — Checklist trước khi push và trước khi phát hành
- `references/release-notes.md` — Template release notes dễ chỉnh sửa
