# Save and Release — Release Notes Template

## Mục tiêu
Release notes nên giúp người đọc trả lời nhanh 4 câu hỏi:
1. Bản này thay đổi gì quan trọng?
2. Có gì cần chú ý khi update hoặc phát hành?
3. Cần kiểm tra gì sau khi phát hành?
4. Nếu có sự cố thì quay lại bản cũ thế nào?

## Cấu trúc khuyến nghị

Template này có thể dùng trực tiếp làm body cho GitHub release, ví dụ với `gh release create vX.Y.Z --notes-file release-notes.md`. Title/tag của release nên khớp `vX.Y.Z` để dễ scan.

```md
# vX.Y.Z

## Summary
- 1-3 gạch đầu dòng mô tả thay đổi quan trọng nhất

## Included changes
### Features
- ...

### Fixes
- ...

### Docs / Internal
- ...

## Upgrade notes
- Env vars mới, migration, config change, hoặc bước thủ công

## Validation
- Những gì cần kiểm tra sau khi deploy/release

## Rollback notes
- Cách quay lại version trước nếu cần
```

## Section nên thêm khi cần
- **Breaking changes**: khi thay đổi hành vi hoặc contract
- **Known issues**: khi có giới hạn đã biết nhưng vẫn chấp nhận phát hành
- **Deprecations**: khi bắt đầu bỏ workflow hoặc API cũ

## Ví dụ ngắn

```md
# v1.4.0

## Summary
- Thêm nhóm skill mới giúp lưu thay đổi, thiết lập publish image cho app Docker, và thiết lập update flow cho app macOS.
- Cải thiện README và marketplace để người dùng mới dễ chọn đúng skill.

## Included changes
### Features
- Thêm skill `save-and-release`.
- Thêm skill `set-up-docker-app-updates`.
- Thêm skill `set-up-macos-app-updates`.

### Docs / Internal
- Bổ sung template và playbook để áp dụng sang repo riêng.

## Upgrade notes
- Không có migration bắt buộc.
- Các YAML/template chỉ là mẫu tham khảo, cần chỉnh theo dự án thực tế.

## Validation
- Kiểm tra skill mới xuất hiện trong marketplace registry.
- Đọc README như user mới và xác nhận mỗi use case có đúng skill tương ứng.

## Rollback notes
- Revert commit thêm các skill mới và phục hồi registry cũ nếu cần.
```
