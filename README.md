# 🐾 ccpoke — Cầu nối thông báo AI Agent

[English](./README.en.md) · [中文](./README.zh.md)

> Tương tác 2 chiều với Claude Code, Codex CLI, Cursor CLI và nhiều AI agent khác qua Telegram — lập trình mọi lúc mọi nơi.

---

## Vấn đề giải quyết

Bạn đang dùng Claude Code, Codex CLI hoặc Cursor CLI trên máy tính. Ra ngoài cầm điện thoại nhưng không biết AI agent đã xong chưa, muốn gửi thêm yêu cầu mà không cần mở laptop.

**ccpoke** là cầu nối 2 chiều giữa AI agent và Telegram — nhận thông báo, gửi yêu cầu, trả lời câu hỏi, quản lý nhiều phiên làm việc — tất cả từ điện thoại.

```
AI agent hoàn thành phản hồi
        ↓
  Stop Hook kích hoạt
        ↓
  ccpoke nhận sự kiện
        ↓
  Thông báo Telegram 📱
```

## Agent hỗ trợ

| | Claude Code | Codex CLI | Cursor CLI |
|---|---|---|---|
| Thông báo Telegram | ✅ macOS · Linux · Windows | ✅ macOS · Linux · Windows | ✅ macOS · Linux · Windows |
| Trò chuyện 2 chiều (Telegram ↔ Agent) | ✅ macOS · Linux | ✅ macOS · Linux | ✅ macOS · Linux |

Thêm agent mới qua kiến trúc plugin — hoan nghênh đóng góp!

## Tính năng

- 🔔 **Thông báo đẩy** — AI agent xong → Telegram nhận tin ngay, không cần kiểm tra liên tục, không trễ
- 💬 **Tương tác 2 chiều** — trò chuyện với AI agent từ Telegram, xem phiên làm việc, gửi yêu cầu, trả lời câu hỏi, phê duyệt quyền
- 🔀 **Đa phiên** — quản lý nhiều phiên AI agent cùng lúc, chuyển đổi nhanh, giám sát song song

## Yêu cầu

- **Node.js** ≥ 20
- **tmux** — tùy chọn, nhưng cần cho `/sessions` và đầy đủ chat 2 chiều
- **Telegram Bot Token** — tạo từ [@BotFather](https://t.me/BotFather)

## Bắt đầu

### Cách 1: npx (không cần cài đặt)

```bash
npx -y @nntoan/ccpoke
```

Lần đầu chạy → tự động thiết lập → khởi động bot. Một lệnh duy nhất.

### Cách 2: Cài đặt toàn cục (khuyến nghị — khởi động nhanh hơn)

```bash
npm i -g @nntoan/ccpoke
ccpoke
```

Trình hướng dẫn cài đặt sẽ dẫn bạn từng bước:

```
┌  🤖 ccpoke setup
│
◇  Language
│  English
│
◇  Telegram Bot Token
│  your-bot-token
│
◇  ✓ Bot: @your_bot
│
◇  Scan QR or open link to connect:
│  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
│  █ ▄▄▄▄▄ █▄▄████▀ ▄██▄▄█ ▄▄▄▄▄ █
│  █ █   █ █ ▀█ ▄▄▄▄▀▀▄▀ █ █   █ █
│  █ █▄▄▄█ █▄ ▄▄▀▄▀██▄  ▄█ █▄▄▄█ █
│  █▄▄▄▄▄▄▄█▄▀▄▀▄▀ █▄▀▄█▄█▄▄▄▄▄▄▄█
│  ...
│  █▄▄▄▄▄▄▄█▄███▄█▄███▄▄▄▄███▄█▄██
│  https://t.me/your_bot?start=setup
│
◇  Waiting for you to send /start to the bot...
│
◆  ✓ Connected! User ID: 123456789
│
◇  Chọn AI agents (ấn cách để chọn)
│  Claude Code, Codex CLI, Cursor CLI
│
◆  Config saved
◆  Hook installed for Claude Code
◆  Hook installed for Codex CLI
◆  Hook installed for Cursor CLI
◆  Chat ID registered
│
└  🎉 Setup complete!
```


## Sử dụng

### Khởi động bot

```bash
# npx (không cần cài đặt)
npx -y @nntoan/ccpoke

# Hoặc cài đặt toàn cục
ccpoke

```

Bot chạy xong → dùng Claude Code / Codex CLI / Cursor CLI bình thường → thông báo tự đến Telegram.

### Xem phiên làm việc đa agent

Khi chạy nhiều agent song song, ccpoke tạo phiên tmux để quản lý. Để xem:

```bash
# Cửa sổ dòng lệnh thường
tmux attach

# iTerm2 (tích hợp gốc)
tmux -CC attach
```

> `ccpoke /sessions` và các phiên khởi chạy từ `/projects` trên Telegram chỉ theo dõi pane bên trong tmux.  
> Nếu OpenCode chạy ở tab terminal thường riêng biệt thì sẽ không hiện — hãy chạy OpenCode trong tmux (hoặc khởi chạy từ `/projects`).

### Đăng ký dự án

Đăng ký dự án để tạo phiên agent mới trực tiếp từ Telegram — không cần mở máy tính.

**Bước 1: Thêm dự án qua dòng lệnh**

```bash
ccpoke project
```

```
┌  📂 Quản lý dự án
│
◇  Chọn thao tác
│  ➕ Thêm dự án mới
│
◇  Đường dẫn dự án
│  /path/to/your/project
│
◇  Tên dự án
│  my-project
│
└  ✅ Đã thêm: my-project → /path/to/your/project
```

**Bước 2: Tạo phiên agent từ Telegram**

Gửi `/projects` trên Telegram → chọn dự án → chọn agent (Claude Code / Codex CLI / Cursor CLI) → agent khởi chạy trong ô tmux mới.

Nếu không có tmux, ccpoke vẫn có thể chạy agent ở chế độ detached nền để gửi notification. Ở chế độ này, `/sessions` và chat control tương tác sẽ bị tắt.

### Lệnh Telegram

| Lệnh        | Chức năng                                                   |
|-------------|-------------------------------------------------------------|
| `/start`    | Đăng ký lại cuộc trò chuyện (tự động khi cài đặt, ít cần)  |
| `/sessions` | Xem danh sách phiên AI agent đang hoạt động                 |
| `/projects` | Xem danh sách dự án và mở phiên mới                         |

### Thông báo mẫu

```
🤖 Phản hồi Claude Code
📂 my-project | ⏱ 45 giây

Đã sửa lỗi xác thực trong login.go. Thay đổi chính:
- Sửa thiếu kiểm tra lỗi ở dòng 42
- Thêm kiểm tra đầu vào...
```

## Bảo mật & Tunnel

Cloudflare Quick Tunnel là tùy chọn. Khuyến nghị hiện tại:

- **Mặc định không mở tunnel** nếu chỉ cần notification/chat qua Telegram/Discord/Slack. Các tính năng này dùng kết nối outbound, không cần expose localhost.
- **Chỉ bật tunnel khi cần xem web response** (link mini app `/response`).
- **Tự host mini app origin của bạn** và set `CCPOKE_MINI_APP_BASE_URL` (HTTPS). ccpoke giờ chỉ cho phép CORS từ origin đã cấu hình và origin tunnel đang chạy.

Tunnel URL sẽ expose gì ra Internet:

- `POST /hook/*` (bảo vệ bởi `X-CCPoke-Secret`, sai secret trả `403`)
- `GET /api/responses/:id` (ID UUID v4, dữ liệu tự hết hạn sau 24h)
- `GET /health`

Trade-off của Cloudflare Quick Tunnel:

- ✅ Setup nhanh, miễn phí, không cần signup
- ⚠️ URL đổi mỗi lần restart, không phải domain cố định
- ✅ Phù hợp truy cập tạm thời qua điện thoại
- ❗ Muốn kiểm soát chặt hơn: dùng `tunnel: false` hoặc tự triển khai HTTPS/reverse proxy riêng.

## Gỡ cài đặt

```bash
ccpoke uninstall
```

```
┌  🗑️  Uninstalling ccpoke
│
◆  Hook removed from Claude Code
◆  Hook removed from Codex CLI
◆  Hook removed from Cursor CLI
◆  Removed ~/.ccpoke/ (config, state, hooks)
│
└  ccpoke uninstalled
```

## Giấy phép

MIT

## Người đóng góp
<a href="https://github.com/lethai2597">
  <img src="https://github.com/lethai2597.png" width="50" />
</a>
<a href="https://github.com/kaida-palooza">
  <img src="https://github.com/kaida-palooza.png" width="50" />
</a>
<a href="https://github.com/nghia1303">
  <img src="https://github.com/nghia1303.png" width="50" />
</a>
<a href="https://github.com/kabuto-png">
  <img src="https://github.com/kabuto-png.png" width="50" />
</a>
<a href="https://github.com/kokorolx">
  <img src="https://github.com/kokorolx.png" width="50" />
</a>
<a href="https://github.com/khanhn87">
  <img src="https://github.com/khanhn87.png" width="50" />
</a>
