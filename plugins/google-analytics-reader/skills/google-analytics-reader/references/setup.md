# GA4 Setup Guide

## 1) Enable API
- Mở Google Cloud Project chứa service account.
- Enable API: **Google Analytics Data API**.

## 2) Create service account key
- Tạo service account + JSON key.
- Đặt biến môi trường:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json"
```

## 3) Grant access in GA4
- Vào GA4 Admin → Property Access Management.
- Add email service account với role ít nhất **Viewer** (hoặc Analyst nếu cần).

## 4) Install dependency

```bash
pip install google-analytics-data
```

## 5) Test query

```bash
python3 scripts/ga4_query.py \
  --property-id 123456789 \
  --preset overview \
  --start-date 7daysAgo \
  --end-date yesterday
```

## Common Errors
- `403 PERMISSION_DENIED`: service account chưa được cấp quyền trong GA4 property.
- `401 UNAUTHENTICATED`: sai hoặc thiếu `GOOGLE_APPLICATION_CREDENTIALS`.
- `Invalid metric/dimension`: dùng tên field không hợp lệ cho Data API.
