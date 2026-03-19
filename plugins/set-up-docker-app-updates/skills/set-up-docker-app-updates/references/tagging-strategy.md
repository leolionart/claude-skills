# Set Up Docker App Updates — Tagging Strategy

## Vì sao tag strategy quan trọng
Nếu chỉ dùng một tag như `latest`, bạn sẽ gặp 3 vấn đề:
- Khó biết image đang chạy được build từ commit nào
- Khó rollback về đúng bản cũ
- Khó phân biệt build thử nghiệm và build release

## Bộ tag khuyến nghị

### `main`
- Đại diện cho build mới nhất từ nhánh `main`
- Hữu ích cho staging hoặc internal testing

### `sha-<shortsha>`
- Ví dụ: `sha-a1b2c3d`
- Dùng để trace chính xác image theo commit
- Rất hữu ích khi debug hoặc rollback

### `vX.Y.Z`
- Ví dụ: `v1.4.0`
- Dùng cho release chính thức
- Nên map trực tiếp từ git tag

### `latest`
- Chỉ nên dùng cho bản release ổn định mới nhất
- Không nên trỏ tới mọi commit trên `main`

## Mapping khuyến nghị

| Git event | Image tags |
|-----------|------------|
| Push vào `main` | `main`, `sha-<shortsha>` |
| Push tag `v1.2.3` | `v1.2.3`, `sha-<shortsha>`, `latest` |

## Mô hình dễ vận hành
Khuyến nghị cho đa số dự án:
- Staging hoặc test: dùng `main`
- Rollback/debug: dùng `sha-<shortsha>`
- Production: dùng `vX.Y.Z` hoặc `latest` trỏ vào release chính thức

## Rule of thumb
- Không dùng `latest` làm nguồn sự thật duy nhất
- Luôn giữ ít nhất một tag truy vết theo commit
- Nếu production cần ổn định cao, deploy bằng version tag cụ thể thay vì `latest`
