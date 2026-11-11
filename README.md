# AETHERIUM: Hộ Vệ Thời Không (Chrono Survivors)

Trò chơi **2D Action Roguelite / Twin-Stick Arena** được xây dựng bằng **TypeScript**, **React 19**, **HTML5 2D Canvas Engine** và **Web Audio API Synthesizer**.

## Tính Năng Nổi Bật

- **Đồ Họa 2D Canvas 60FPS Đa Tầng**: Bầu trời sao Parallax, lưới quang học phản ứng xung kích, hiệu ứng chém bán nguyệt, tia sét dây chuyền, bóng mờ khi lướt (Afterimages) và hạt vật lý phát sáng.
- **Bộ Tổng Hợp Âm Thanh Web Audio API**: Tự động tổng hợp hiệu ứng âm thanh (kiếm chém, súng điện từ, sét giật, vụ nổ, nhặt ngọc combo) và nhạc nền thích ứng theo thời gian thực.
- **3 Lớp Nhân Vật & Tuyệt Kỹ Chủ Động**:
  - **Valkyrie Aegis**: Cận chiến diện rộng với *Kiếm Plasma*, tuyệt kỹ *Nhát Chém Phân Quang*.
  - **Arcane Technomancer**: Đạn tự dẫn *Lăng Kính Lượng Tử*, tuyệt kỹ *Siêu Tân Tinh Hư Không*.
  - **Void Ranger**: Súng đôi xuyên thấu chí mạng cao, tuyệt kỹ *Ma Trận Quá Tải* làm chậm thời gian kẻ địch.
- **8 Vũ Khí & Phản Ứng Nguyên Tố**: Kết hợp *Cryo + Lightning/Plasma* kích hoạt **Siêu Dẫn (+50% sát thương)**; kết hợp *Solar + Arcane* kích hoạt **Quá Nhiệt (+45% sát thương)**.
- **Trùm Đa Giai Đoạn & Chế Độ Vô Tận**: Chạm trán **Chronos Titan** ở Đợt 5 & Đợt 10, kèm hệ thống Xưởng Nâng Cấp Vĩnh Viễn, Bách Khoa Toàn Thư và Bảng Vàng Lịch Sử.

## Kiến Trúc Thư Mục

```text
src/
├── data/       # Truy xuất dữ liệu bất đồng bộ (Timeout/Retry), danh mục Anh Hùng, Vũ Khí, Kẻ Địch
├── services/   # Xử lý nghiệp vụ: Game Engine, Vật lý, Vũ khí, AI Quái/Boss, Âm thanh, Renderer 2D
├── hooks/      # Custom React Hooks kết nối vòng lặp Canvas, điều khiển bàn phím/chuột & Hồ sơ
├── ui/         # Giao diện người dùng: Sảnh chính, HUD, Thẻ nâng cấp, Xưởng cơ khí, Bảng vàng
├── types/      # Định nghĩa kiểu dữ liệu TypeScript nghiêm ngặt
└── styles/     # Giao diện Cyberpunk / Sci-Fi hiện đại
```

## Hướng Dẫn Chạy Dự Án

```bash
# Cài đặt thư viện
npm install

# Chạy máy chủ phát triển (http://localhost:5173)
npm run dev

# Kiểm tra kiểu dữ liệu & đóng gói bản Production
npm run build
```

## Điều Khiển Trong Trận

- `WASD` / `Phím Mũi Tên`: Di chuyển nhân vật
- `Space` / `Shift`: Lướt Né (Dash - Bất tử tạm thời)
- `Phím E` / `Chuột Phải`: Kích hoạt Tuyệt Kỹ Tối Thượng
- `Phím Q`: Bật / Tắt chế độ Tự Động Ngắm (Auto-Aim)
- `Phím 1 / 2 / 3`: Chọn nhanh thẻ nâng cấp khi lên cấp
- `Esc` / `Phím P`: Tạm dừng chiến dịch
