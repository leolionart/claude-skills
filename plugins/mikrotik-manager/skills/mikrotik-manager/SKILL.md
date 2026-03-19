---
name: mikrotik-manager
description: Quản lý và theo dõi MikroTik Router (Logs, Health, DHCP, Firewall).
metadata: {"clawdbot":{"emoji":"📶","requires":{"bins":["sshpass","ssh"]}}}
---

# MikroTik Manager

Kỹ năng này giúp Nô kết nối và điều khiển Router MikroTik qua SSH.

Trước khi dùng, export credential qua env:

```bash
export MIKROTIK_HOST='192.168.88.1'
export MIKROTIK_USER='admin'
export MIKROTIK_PASSWORD='your_password_here'
```

## Thông tin kết nối (Mặc định)
- **Host:** `MIKROTIK_HOST` (ví dụ: `192.168.88.1`)
- **User:** `MIKROTIK_USER`
- **Password:** `MIKROTIK_PASSWORD`

> Không hardcode credential thật trong skill. Hãy export biến môi trường trước khi chạy lệnh.

## Các lệnh phổ biến

### 1. Xem Log
```bash
sshpass -p "$MIKROTIK_PASSWORD" ssh -o StrictHostKeyChecking=no "$MIKROTIK_USER@$MIKROTIK_HOST" "/log print"
```

### 2. Kiểm tra tài nguyên hệ thống
```bash
sshpass -p "$MIKROTIK_PASSWORD" ssh -o StrictHostKeyChecking=no "$MIKROTIK_USER@$MIKROTIK_HOST" "/system resource print; /system health print"
```

### 3. Xem danh sách thiết bị (DHCP Leases)
```bash
sshpass -p "$MIKROTIK_PASSWORD" ssh -o StrictHostKeyChecking=no "$MIKROTIK_USER@$MIKROTIK_HOST" "/ip dhcp-server lease print"
```

### 4. Kiểm tra trạng thái Internet (PPPoE)
```bash
sshpass -p "$MIKROTIK_PASSWORD" ssh -o StrictHostKeyChecking=no "$MIKROTIK_USER@$MIKROTIK_HOST" "/interface pppoe-client monitor [find] once"
```

## Lưu ý
- Luôn báo cáo tình trạng CPU và nhiệt độ nếu Boss hỏi về sức khỏe hệ thống.
- Cảnh báo ngay nếu thấy log có DHCP lạ từ untrusted port.
