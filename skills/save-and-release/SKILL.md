---
name: save-and-release
description: Save your work safely, push it when ready, and handle GitHub releases with version bumps, tags, release notes, and advisory gitleaks checks.
version: 1.0.1
---

# Save and Release

## Overview
Dùng skill này khi bạn muốn hoàn tất một đợt thay đổi theo workflow dễ hiểu: lưu thay đổi, đẩy branch lên remote, rồi hoàn tất các bước GitHub release nếu cần.

Skill này phù hợp cho 4 nhu cầu phổ biến:
- **Lưu thay đổi** bằng commit message rõ ràng
- **Đẩy thay đổi lên remote** khi branch đã sẵn sàng
- **Chuẩn bị phát hành** với checklist và release notes dễ đọc
- **Thực hiện GitHub release** với version bump, tag, và `gh release create`

Nếu repo đang dùng plugin `git-sync`, cần phân biệt:
- `git-sync` tự động commit/push qua hooks
- `save-and-release` là workflow chủ động để kiểm tra kỹ trước khi gửi thay đổi hoặc phát hành

## Khi nào dùng skill này
- Bạn muốn “lưu thay đổi” thành commit sạch
- Bạn muốn push branch sau khi review local changes
- Bạn muốn chuẩn bị release notes hoặc checklist trước khi phát hành
- Bạn muốn đi hết luồng GitHub release từ version bump đến publish release
- Bạn muốn một quy trình an toàn, dễ giải thích cho người khác review

## Inputs required
- Bạn muốn làm bước nào: chỉ lưu thay đổi, lưu + đẩy lên, chuẩn bị phát hành, hay publish GitHub release
- Branch hiện tại và target remote nếu cần push
- Trạng thái local changes và commit log gần đây
- Nếu có phát hành: version dự kiến, format tag, và đối tượng đọc release notes
- Nếu publish release: xác nhận repo đúng và `gh` đã sẵn sàng để tạo release

## Workflow / Decision tree
1. **Save only**
   - Kiểm tra thay đổi local
   - Nếu máy/repo có `gitleaks` hoặc `gitleak`, chạy check để rà secret nghi vấn
   - Review diff và cảnh báo nếu `gitleaks` báo nghi vấn
   - Tạo commit message ngắn, rõ mục đích

2. **Save and push**
   - Làm toàn bộ bước save
   - Kiểm tra branch tracking / remote state
   - Push branch sau khi xác nhận đúng remote

3. **Prepare a release**
   - Xác định phạm vi thay đổi của bản phát hành
   - Chạy checklist trước khi release
   - Kiểm tra chiến lược version bump và tag của repo
   - Soạn release notes draft để review

4. **Write release notes**
   - Gom nhóm thay đổi theo feature / fix / docs / internal
   - Ghi rõ điều cần lưu ý khi update hoặc rollback
   - Chuẩn bị markdown có thể dùng lại cho GitHub release

5. **Execute GitHub release**
   - Bump version theo convention của repo và tạo commit tương ứng nếu cần
   - Tạo tag cho version mới và push tag lên remote
   - Push branch nếu release phụ thuộc vào commit mới chưa được đẩy
   - Tạo GitHub release bằng `gh release create` với release notes đã review

## Output standards
- Nếu lưu thay đổi: trả về commit hash ngắn + ý nghĩa commit
- Nếu push: nêu branch/remote đã push
- Nếu chuẩn bị release: nêu rõ mục nào pass/fail trong checklist, version dự kiến, và tag format
- Nếu soạn release notes: trả về markdown dễ scan, có section rõ ràng
- Nếu tạo GitHub release: trả về version, tag, và release URL hoặc lỗi cần xử lý

## Failure modes / lỗi thường gặp
- Còn file rác hoặc file chưa review trong working tree
- Branch chưa tracking remote
- Hook fail nên commit chưa tạo thành công
- `gitleaks` hoặc `gitleak` cảnh báo secret nghi vấn cần review thủ công
- Version bump chưa rõ hoặc tag không khớp version
- Tag đã tồn tại hoặc remote tag conflict
- `gh` chưa auth hoặc repo đích không đúng
- Chưa xác định phạm vi release nên notes thiếu hoặc sai trọng tâm

## Safety notes
- Không force push nếu chưa có user approval rõ ràng
- Không bỏ qua hooks bằng `--no-verify` trừ khi user yêu cầu rõ
- `gitleaks` / `gitleak` chỉ là bước cảnh báo/advisory; không tự động chặn commit hoặc push
- Không tạo/push tag hoặc chạy `gh release create` nếu user chưa xác nhận rõ việc publish
- Không commit secrets, `.env`, credentials, screenshot debug hay `.playwright-mcp/`
- Không coi là release-ready nếu checklist còn blocker

## Resources
- `references/checklist.md` — Checklist trước khi push và trước khi phát hành
- `references/release-notes.md` — Template release notes dễ chỉnh sửa
