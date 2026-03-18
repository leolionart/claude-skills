---
name: save-and-release
description: Save your work safely, push it when ready, and prepare clear release notes when it's time to ship.
version: 1.0.0
---

# Save and Release

## Overview
Dùng skill này khi bạn muốn hoàn tất một đợt thay đổi theo workflow dễ hiểu: lưu thay đổi, đẩy branch lên remote, rồi chuẩn bị thông tin phát hành nếu cần.

Skill này phù hợp cho 3 nhu cầu phổ biến:
- **Lưu thay đổi** bằng commit message rõ ràng
- **Đẩy thay đổi lên remote** khi branch đã sẵn sàng
- **Chuẩn bị phát hành** với checklist và release notes dễ đọc

Nếu repo đang dùng plugin `git-sync`, cần phân biệt:
- `git-sync` tự động commit/push qua hooks
- `save-and-release` là workflow chủ động để kiểm tra kỹ trước khi gửi thay đổi hoặc phát hành

## Khi nào dùng skill này
- Bạn muốn “lưu thay đổi” thành commit sạch
- Bạn muốn push branch sau khi review local changes
- Bạn muốn chuẩn bị release notes hoặc checklist trước khi phát hành
- Bạn muốn một quy trình an toàn, dễ giải thích cho người khác review

## Inputs required
- Bạn muốn làm bước nào: chỉ lưu thay đổi, lưu + đẩy lên, hay chuẩn bị phát hành
- Branch hiện tại và target remote nếu cần push
- Trạng thái local changes và commit log gần đây
- Nếu có phát hành: version dự kiến và đối tượng đọc release notes

## Workflow / Decision tree
1. **Save only**
   - Kiểm tra thay đổi local
   - Review diff
   - Tạo commit message ngắn, rõ mục đích

2. **Save and push**
   - Làm toàn bộ bước save
   - Kiểm tra branch tracking / remote state
   - Push branch sau khi xác nhận đúng remote

3. **Prepare a release**
   - Xác định phạm vi thay đổi của bản phát hành
   - Chạy checklist trước khi release
   - Soạn release notes draft để review

4. **Write release notes**
   - Gom nhóm thay đổi theo feature / fix / docs / internal
   - Ghi rõ điều cần lưu ý khi update hoặc rollback

## Output standards
- Nếu lưu thay đổi: trả về commit hash ngắn + ý nghĩa commit
- Nếu push: nêu branch/remote đã push
- Nếu chuẩn bị release: nêu rõ mục nào pass/fail trong checklist
- Nếu soạn release notes: trả về markdown dễ scan, có section rõ ràng

## Failure modes / lỗi thường gặp
- Còn file rác hoặc file chưa review trong working tree
- Branch chưa tracking remote
- Hook fail nên commit chưa tạo thành công
- Chưa xác định phạm vi release nên notes thiếu hoặc sai trọng tâm

## Safety notes
- Không force push nếu chưa có user approval rõ ràng
- Không bỏ qua hooks bằng `--no-verify` trừ khi user yêu cầu rõ
- Không commit secrets, `.env`, credentials, screenshot debug hay `.playwright-mcp/`
- Không coi là release-ready nếu checklist còn blocker

## Resources
- `references/checklist.md` — Checklist trước khi push và trước khi phát hành
- `references/release-notes.md` — Template release notes dễ chỉnh sửa
