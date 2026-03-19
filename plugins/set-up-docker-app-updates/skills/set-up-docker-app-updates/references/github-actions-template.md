# Set Up Docker App Updates — GitHub Actions Template

## Workflow mẫu

```yaml
name: Build and publish Docker image

on:
  push:
    branches:
      - main
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: read
  packages: write

jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=raw,value=main,enable=${{ github.ref == 'refs/heads/main' }}
            type=sha,prefix=sha-
            type=ref,event=tag
            type=raw,value=latest,enable=${{ startsWith(github.ref, 'refs/tags/v') }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

## Cách đọc template
- `main`: luôn có tag dễ nhớ cho nhánh chính
- `sha-...`: giúp trace đúng build từ commit nào
- `vX.Y.Z`: xuất hiện khi push git tag release
- `latest`: chỉ gắn cho release tag, tránh trỏ vào mọi commit trên `main`

## Khi nào cần chỉnh thêm
- Nếu repo build multi-arch: thêm `platforms: linux/amd64,linux/arm64`
- Nếu image name khác repo name: thay `ghcr.io/${{ github.repository }}`
- Nếu chỉ muốn publish khi release: bỏ trigger branch `main`

## Lưu ý
- Đây là template tham khảo, không phải file workflow bắt buộc phải đặt vào repo này.
- Khi áp dụng sang repo riêng, cần kiểm tra lại Dockerfile, build context và naming convention.
