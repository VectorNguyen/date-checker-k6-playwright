# Date Checker — k6 + Playwright

Web kiểm tra ngày/tháng/năm hợp lệ, dùng để demo hai loại kiểm thử:

| Demo | Công cụ | Kiểm tra cái gì |
|---|---|---|
| **1. Performance testing** | k6 | Tốc độ và tỷ lệ lỗi của **API** `/api/validate-date` khi có nhiều người dùng cùng lúc |
| **2. Visual regression** | Playwright (screenshot) | **Giao diện web** có bị thay đổi so với ảnh chuẩn hay không |

> Web và API dùng chung logic trong `src/date-validator.js`.
> Web tự kiểm tra ngày ngay trong trình duyệt (không gọi API), nên k6 chỉ test API, còn Playwright chỉ test giao diện.

**Mục lục**

- [Phần A — Cài đặt lần đầu (người mới)](#phần-a--cài-đặt-lần-đầu-người-mới)
- [Phần B — Đã cài rồi: các lệnh để chạy](#phần-b--đã-cài-rồi-các-lệnh-để-chạy)
- [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## Phần A — Cài đặt lần đầu (người mới)

Hướng dẫn cho **Windows + PowerShell**. Chỉ cần làm một lần trên mỗi máy.
Mở PowerShell bằng cách: nhấn phím Windows → gõ `PowerShell` → Enter.

### Bảng tóm tắt

| Bước | Cài gì | Lệnh | Kiểm tra đã cài xong |
|---|---|---|---|
| 1 | Node.js (bản LTS) | `winget install OpenJS.NodeJS.LTS` | `node -v` và `npm -v` hiện số phiên bản |
| 2 | Git | `winget install Git.Git` | `git --version` |
| 3 | k6 | `winget install k6 --source winget` | `k6 version` |
| 4 | Tải code về | `git clone https://github.com/VectorNguyen/date-checker-k6-playwright.git` | Có thư mục `date-checker-k6-playwright` |
| 5 | Thư viện của dự án (Playwright, Vite) | `npm ci` | Có thư mục `node_modules` |
| 6 | Trình duyệt cho Playwright | `npx playwright install chromium` | Không báo lỗi |
| 7 | Tạo ảnh chuẩn trên máy mình | `npm run test:visual:update` | `3 passed` |

> **Quan trọng:** sau bước 1, 2 và 3, **đóng PowerShell rồi mở lại** thì máy mới nhận lệnh `node`, `git`, `k6`.
> Đã có Node.js hoặc Git rồi thì bỏ qua bước tương ứng.
> Không dùng được `winget`? Tải bản cài từ https://nodejs.org (chọn LTS), https://git-scm.com và https://grafana.com/docs/k6/latest/set-up/install-k6/.

### Chi tiết từng bước

**Bước 1–3: cài phần mềm**

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install k6 --source winget
```

Đóng PowerShell, mở lại, rồi kiểm tra:

```powershell
node -v
npm -v
git --version
k6 version
```

Cả bốn lệnh đều phải in ra số phiên bản. Nếu báo `not recognized`, xem mục [Xử lý lỗi](#xử-lý-lỗi-thường-gặp).

**Bước 4: tải code và mở bằng VS Code**

```powershell
cd $HOME\Documents
git clone https://github.com/VectorNguyen/date-checker-k6-playwright.git
cd date-checker-k6-playwright
code .
```

Từ đây trở đi, gõ lệnh trong **terminal của VS Code** (menu *Terminal → New Terminal*). Terminal phải đang ở thư mục `date-checker-k6-playwright`.

**Bước 5–6: cài thư viện và trình duyệt cho Playwright**

```powershell
npm ci
npx playwright install chromium
```

- `npm ci` cài đúng các phiên bản ghi trong `package-lock.json`, trong đó có Playwright.
- k6 **không** cài qua npm. k6 là chương trình riêng, đã cài ở bước 3.

**Bước 7: tạo ảnh chuẩn (baseline) cho visual test**

```powershell
npm run test:visual:update
```

Lệnh này chụp 3 ảnh và lưu vào `tests/visual/date-checker.spec.ts-snapshots/`. Tên file có đuôi theo hệ điều hành:

| Hệ điều hành | Tên file ảnh chuẩn |
|---|---|
| Windows | `*-chromium-win32.png` |
| Linux | `*-chromium-linux.png` |
| macOS | `*-chromium-darwin.png` |

Mở 3 ảnh của máy mình ra xem giao diện có đúng không rồi mới dùng làm ảnh chuẩn.
Mỗi máy và mỗi hệ điều hành render font khác nhau một chút, nên **mỗi người tự tạo ảnh chuẩn trên máy mình**. Không dùng ảnh của máy khác.

✅ Cài xong. Chuyển sang Phần B.

<details>
<summary>Dùng macOS hoặc Linux?</summary>

| | macOS (Homebrew) | Ubuntu/Debian |
|---|---|---|
| Node.js | `brew install node` | Cài theo https://nodejs.org (bản LTS) |
| k6 | `brew install k6` | Xem https://grafana.com/docs/k6/latest/set-up/install-k6/ |
| Playwright | `npm ci` rồi `npx playwright install chromium` | `npm ci` rồi `npx playwright install --with-deps chromium` |

Các lệnh `npm run ...` ở Phần B dùng giống hệt nhau trên mọi hệ điều hành.
</details>

---

## Phần B — Đã cài rồi: các lệnh để chạy

### Bảng lệnh nhanh

| Mục đích | Lệnh | Kết quả mong đợi |
|---|---|---|
| Mở web | `npm run dev` | Mở http://localhost:5173 |
| Bật API (bình thường) | `npm run api` | `API: http://127.0.0.1:3001 (normal)` |
| Bật API (chậm, để demo FAIL) | `npm run api:slow` | `API: http://127.0.0.1:3001 (700ms demo delay)` |
| Load test 10 VUs, 30 giây | `npm run test:load` | PASS (khi API bình thường) |
| Load test 50 VUs | `npm run test:load -- -e VUS=50` | PASS (khi API bình thường) |
| Visual test | `npm run test:visual` | 3 passed |
| Visual test FAIL có chủ đích | `npm run test:visual:fail` | 3 failed |
| Xem báo cáo Playwright | `npm run report` | Mở báo cáo HTML trên trình duyệt |
| Tạo lại ảnh chuẩn | `npm run test:visual:update` | 3 passed (**chỉ dùng khi giao diện mới đã được duyệt**) |
| Test chức năng (E2E) | `npm run test:e2e` | 16 passed |
| Kiểm tra build | `npm run build` | `✓ built` |

> Khi một demo FAIL, terminal sẽ báo `npm ERR!` hoặc `exit code 1`/`99`. Đây là **kết quả mong đợi** của demo FAIL, không phải cài đặt bị hỏng.

---

### Demo 1 — Performance testing với k6

Cần mở **2 terminal**: terminal 1 chạy API, terminal 2 chạy k6. Bấm dấu `+` trong panel Terminal của VS Code để mở thêm terminal.

**1a. Chạy PASS**

Terminal 1 (giữ nguyên, không tắt):

```powershell
npm run api
```

Có thể thử API trên trình duyệt: http://127.0.0.1:3001/api/validate-date?day=29&month=2&year=2024

Terminal 2:

```powershell
npm run test:load
npm run test:load -- -e VUS=50
```

Mỗi lần chạy kéo dài 30 giây, lần lượt với 10 và 50 người dùng ảo (VUs).
Mỗi VU gọi API khoảng 1 lần/giây với 3 trường hợp: 29/02/2024 (hợp lệ), 29/02/2023 (không hợp lệ), 31/04/2025 (không hợp lệ).
Script kiểm tra hai điều: API trả **HTTP 200**, và kết quả `isValid` đúng với từng ngày.

> Ngày không hợp lệ vẫn trả HTTP 200 với `"isValid": false`. HTTP 200 nghĩa là API đã xử lý yêu cầu thành công, không có nghĩa là ngày hợp lệ.

**Cách đọc kết quả k6**

| Chỉ số | Ý nghĩa | Ngưỡng (threshold) |
|---|---|---|
| `http_req_duration` p(95) | 95% request phản hồi nhanh hơn mức này | < 500ms |
| `http_req_failed` | Tỷ lệ request lỗi (mất kết nối, HTTP 4xx/5xx) | < 1% |
| `checks` | Tỷ lệ kiểm tra đúng (HTTP 200 + kết quả đúng) | = 100% |
| `http_reqs` | Tổng số request đã gửi | (chỉ để tham khảo) |

Dòng có dấu ✓ là đạt ngưỡng, dấu ✗ là không đạt. Chỉ cần một ngưỡng không đạt là k6 báo FAIL.

**1b. Demo FAIL có chủ đích**

1. Terminal 1: bấm `Ctrl + C` để tắt API, sau đó chạy:
   ```powershell
   npm run api:slow
   ```
2. Terminal 2: chạy lại:
   ```powershell
   npm run test:load
   ```
3. Kết quả: `http_req_duration` p(95) khoảng 700ms, vượt ngưỡng 500ms nên **FAIL**. `checks` vẫn 100% vì kết quả vẫn đúng, chỉ chậm.
4. Khôi phục: terminal 1 bấm `Ctrl + C` rồi chạy `npm run api`.

> Lưu ý khi trình bày:
> - Độ trễ 700ms là **cố ý thêm vào** để minh họa việc vi phạm tiêu chí hiệu năng. Đây không phải bằng chứng hệ thống bị quá tải.
> - Tăng VUs từ 10 lên 50 chỉ minh họa việc tăng tải. Repo này **không** chứng minh khả năng mở rộng (scalability), vì không thay đổi tài nguyên hay số instance.
> - Muốn thấy `http_req_failed` FAIL: tắt hẳn API (Ctrl + C) rồi chạy `npm run test:load`, khi đó 100% request lỗi.

---

### Demo 2 — Visual regression với Playwright screenshots

Không cần bật `npm run dev` trước. Playwright tự khởi động web nếu web chưa chạy.
Phải làm xong **Bước 7** ở Phần A (đã có ảnh chuẩn trên máy mình).

**2a. Chạy PASS**

```powershell
npm run test:visual
```

Kết quả mong đợi: **3 passed**

| Test | Ảnh chụp |
|---|---|
| `initial form` | Form lúc mới mở |
| `valid leap year result` | Sau khi bấm mẫu 29/02/2024 (hợp lệ, năm nhuận) |
| `invalid date result` | Sau khi bấm mẫu 29/02/2023 (không hợp lệ) |

**2b. Demo FAIL có chủ đích**

```powershell
npm run test:visual:fail
npm run report
```

Kết quả mong đợi: **3 failed**. Script chèn thêm CSS lúc chạy test để đổi nút "Kiểm Tra Ngày" sang màu đỏ. Code giao diện gốc không bị sửa.
Trong báo cáo, bấm vào từng test để xem 3 ảnh: **Expected** (ảnh chuẩn), **Actual** (ảnh vừa chụp) và **Diff** (vùng khác nhau được tô màu).
Chạy `npm run test:visual` lần nữa sẽ thấy PASS trở lại.

> ⚠️ **Không chạy `test:visual:update` sau demo FAIL.** Lệnh đó sẽ ghi đè ảnh chuẩn bằng giao diện nút đỏ.
> Chỉ cập nhật ảnh chuẩn khi giao diện mới đã được duyệt.

Để ảnh chụp ổn định giữa các lần chạy, test đã tắt animation/transition. Web không tải Google Fonts mà dùng font hệ thống.

---

### Cấu trúc thư mục

```
src/date-validator.js        Logic kiểm tra ngày (web và API dùng chung)
src/main.js, index.html      Giao diện web
server/index.js              API cho k6 (cổng 3001), thêm --slow để chậm 700ms
tests/performance/load.js    Script k6 (VUS, DURATION, BASE_URL đổi được bằng -e)
tests/visual/                Visual test + thư mục ảnh chuẩn
tests/e2e/                   Test chức năng
scripts/visual-fail.js       Chạy visual test với CSS nút đỏ (VISUAL_DEMO=1)
playwright.config.ts         Cấu hình Playwright (tự bật web ở cổng 5173)
```

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `'node' / 'k6' / 'git' is not recognized` | Terminal mở trước khi cài xong | Đóng hết terminal và VS Code, mở lại |
| `running scripts is disabled on this system` khi chạy `npm`/`npx` | PowerShell chặn script | Chạy một lần: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, chọn `Y` |
| k6: `connection refused` / `checks 0%` | Chưa bật API | Mở terminal khác, chạy `npm run api` |
| `EADDRINUSE ... 3001` | API đang chạy ở terminal khác | Dùng terminal đang chạy API, hoặc bấm Ctrl + C ở đó rồi chạy lại |
| Playwright: `Port 5173 is already in use` | Cổng 5173 bị chương trình khác chiếm | Tắt chương trình đang dùng cổng 5173 |
| `Executable doesn't exist ... chromium` | Chưa cài trình duyệt cho Playwright | `npx playwright install chromium` |
| Visual test: `A snapshot doesn't exist ... writing actual` | Chưa có ảnh chuẩn cho máy/hệ điều hành này | `npm run test:visual:update` |
| Visual test FAIL dù không sửa gì | Ảnh chuẩn tạo trên máy khác, hoặc đổi độ phân giải/zoom màn hình | Tạo lại ảnh chuẩn trên máy mình bằng `npm run test:visual:update` |

---

## Tài liệu tham khảo

- k6, bắt đầu: https://grafana.com/docs/k6/latest/get-started/
- k6, thresholds: https://grafana.com/docs/k6/latest/using-k6/thresholds/
- Playwright, visual comparisons: https://playwright.dev/docs/test-snapshots
- Playwright, cài đặt: https://playwright.dev/docs/intro
