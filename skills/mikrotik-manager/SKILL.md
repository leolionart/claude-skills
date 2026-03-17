---
name: mikrotik-manager
description: Quản lý và theo dõi MikroTik Router (Logs, Health, DHCP, Firewall).
metadata: {"clawdbot":{"emoji":"📶","requires":{"bins":["sshpass","ssh"]}}}
---

# MikroTik Manager

Kỹ năng này giúp Nô kết nối và điều khiển Router MikroTik qua SSH.

## Thông tin kết nối (Mặc định)
- **Host:** `172.16.0.1`
- **User:** `admin`
- **Password:** `Q214119@i103158`

## Các lệnh phổ biến

### 1. Xem Log
```bash
sshpass -p 'Q214119@i103158' ssh -o StrictHostKeyChecking=no admin@172.16.0.1 "/log print"
```

### 2. Kiểm tra tài nguyên hệ thống
```bash
sshpass -p 'Q214119@i103158' ssh -o StrictHostKeyChecking=no admin@172.16.0.1 "/system resource print; /system health print"
```

### 3. Xem danh sách thiết bị (DHCP Leases)
```bash
sshpass -p 'Q214119@i103158' ssh -o StrictHostKeyChecking=no admin@172.16.0.1 "/ip dhcp-server lease print"
```

### 4. Kiểm tra trạng thái Internet (PPPoE)
```bash
sshpass -p 'Q214119@i103158' ssh -o StrictHostKeyChecking=no admin@172.16.0.1 "/interface pppoe-client monitor [find] once"
```

## Lưu ý
- Luôn báo cáo tình trạng CPU và nhiệt độ nếu Boss hỏi về sức khỏe hệ thống.
- Cảnh báo ngay nếu thấy log có DHCP lạ từ untrusted port.
