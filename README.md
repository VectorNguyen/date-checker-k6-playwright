# Date Checker — k6 + Playwright

Web kiểm tra ngày/tháng/năm hợp lệ, dùng để demo hai loại kiểm thử:

| Demo | Công cụ | Kiểm tra cái gì |
|---|---|---|
| **1. Visual regression** | Playwright (screenshot) | **Giao diện web** có bị thay đổi so với ảnh chuẩn hay không |
| **2. Performance testing** | k6 | Tốc độ và tỷ lệ lỗi của **API** `/api/validate-date` khi nhiều người dùng gọi cùng lúc |

> Web và API dùng chung logic trong `src/date-validator.js`.
> Web tự kiểm tra ngày ngay trong trình duyệt (không gọi API), nên k6 chỉ test API, còn Playwright chỉ test giao diện.

**Mục lục**

- [Phần A — Cài đặt lần đầu](#phần-a--cài-đặt-lần-đầu)
- [Phần B — Chạy test (mỗi lần mở máy)](#phần-b--chạy-test-mỗi-lần-mở-máy)
  - [Demo 1 — Visual regression (Playwright)](#demo-1--visual-regression-playwright)
  - [Demo 2 — Performance testing (k6)](#demo-2--performance-testing-k6)
- [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## ⚠️ Quy tắc quan trọng nhất: luôn đứng đúng thư mục

Mọi lệnh `npm ...` phải chạy trong **thư mục có file `package.json`**.

Nếu bạn tải bằng **ZIP** từ GitHub, sau khi giải nén code nằm trong **thư mục con**, ví dụ:

```
C:\...\date-checker-k6-playwright\date-checker-k6-playwright\     ← thư mục đúng (có package.json)
C:\...\date-checker-k6-playwright\                                ← SAI, thiếu 1 cấp
```

Kiểm tra nhanh: chạy `dir package.json`. Lệnh phải hiện ra file.
Nếu chạy `npm` mà báo lỗi `Could not read package.json ... C:\package.json`, tức là bạn **đang đứng sai thư mục**.

**Mẹo:** trong VS Code chọn *File → Open Folder* và mở đúng thư mục có `package.json`. Mọi terminal mở sau đó sẽ tự đứng đúng chỗ.
**Mỗi terminal mới mở đều phải đứng đúng thư mục này.**

---

## Phần A — Cài đặt lần đầu

Hướng dẫn cho **Windows + PowerShell**. Chỉ cần làm **một lần** trên mỗi máy.

### A1. Cài phần mềm: Node.js, Git, k6

Mở PowerShell (phím Windows → gõ `PowerShell` → Enter) rồi chạy:

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install k6 --source winget
```

**Đóng PowerShell / VS Code rồi mở lại**, sau đó kiểm tra:

```powershell
node -v
npm -v
git --version
k6 version
```

Cả 4 lệnh phải in ra số phiên bản. Báo `not recognized` nghĩa là chưa cài xong hoặc chưa mở lại terminal.

> Không dùng được `winget`? Tải bản cài từ https://nodejs.org (bản LTS), https://git-scm.com và https://grafana.com/docs/k6/latest/set-up/install-k6/.
> Máy đã có Node.js hoặc Git thì bỏ qua lệnh tương ứng.

### A2. Tải code về

**Cách 1: dùng git (khuyên dùng, không bị thư mục lồng):**

```powershell
cd $HOME\Downloads
git clone https://github.com/VectorNguyen/date-checker-k6-playwright.git
cd date-checker-k6-playwright
dir package.json
```

**Cách 2: tải ZIP:** vào trang GitHub → *Code → Download ZIP* → giải nén. Sau đó `cd` vào **thư mục con có `package.json`** (xem phần quy tắc ở trên).

### A3. Cài thư viện dự án và trình duyệt cho Playwright

Chạy trong thư mục có `package.json`:

```powershell
npm ci
npx playwright install chromium
```

- `npm ci` cài đúng các phiên bản ghi trong `package-lock.json` (Playwright, Vite).
- `npx playwright install chromium` tải trình duyệt Chromium **và** Chromium Headless Shell. Test dùng bản headless shell. **Đợi lệnh chạy xong hẳn**, tức là terminal hiện lại dấu nhắc `PS C:\...>`.
- k6 **không** cài qua npm. k6 là chương trình riêng, đã cài ở bước A1.

> **Mạng chậm, tải trình duyệt bị timeout?** Tăng thời gian chờ rồi cài lại:
> ```powershell
> $env:PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT = "120000"
> npx playwright install chromium
> ```
> Nếu sau đó test vẫn báo thiếu `headless_shell.exe`, cài riêng phần này:
> ```powershell
> npx playwright install chromium-headless-shell
> ```

### A4. Tạo ảnh chuẩn (baseline) cho visual test

```powershell
npm run test:visual:update
```

Kết quả đúng: **`3 passed`**. Ba ảnh được lưu vào `tests/visual/date-checker.spec.ts-snapshots/`, tên file có đuôi theo hệ điều hành: `-win32.png` (Windows), `-linux.png`, `-darwin.png` (macOS).

Mỗi máy render font hơi khác nhau, nên **mỗi người tự tạo ảnh chuẩn trên máy mình**. Vì vậy thư mục ảnh chuẩn đã nằm trong `.gitignore` và không được đưa lên GitHub.

### A5. Kiểm tra cài đặt đã xong

```powershell
npm run test:visual
npm run test:e2e
```

Thấy `3 passed` và `16 passed` là **cài xong**. Chuyển sang Phần B.

<details>
<summary><b>Toàn bộ lệnh cài đặt (copy một lần)</b></summary>

```powershell
# A1. Cài phần mềm (xong thì ĐÓNG và MỞ LẠI terminal)
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install k6 --source winget

# Kiểm tra
node -v
npm -v
git --version
k6 version

# A2. Tải code
cd $HOME\Downloads
git clone https://github.com/VectorNguyen/date-checker-k6-playwright.git
cd date-checker-k6-playwright

# A3. Cài thư viện + trình duyệt
npm ci
npx playwright install chromium

# A4. Tạo ảnh chuẩn
npm run test:visual:update

# A5. Kiểm tra
npm run test:visual
npm run test:e2e
```
</details>

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

## Phần B — Chạy test (mỗi lần mở máy)

Tắt máy mở lại thì **không cần cài lại gì cả**. Chỉ cần đứng đúng thư mục rồi chạy lệnh.

```powershell
cd <đường-dẫn-tới>\date-checker-k6-playwright      # thư mục có package.json
```

### Bảng lệnh nhanh

| Mục đích | Lệnh | Kết quả đúng |
|---|---|---|
| Visual test | `npm run test:visual` | 3 passed |
| Visual test FAIL có chủ đích | `npm run test:visual:fail` | 3 failed |
| Xem báo cáo Playwright | `npm run report` | Mở http://localhost:9323 (`Ctrl + C` để tắt) |
| Tạo lại ảnh chuẩn | `npm run test:visual:update` | 3 passed (chỉ chạy khi giao diện mới đã được duyệt) |
| Bật API bình thường | `npm run api` | `API: http://127.0.0.1:3001 (normal)` |
| Bật API chậm (demo FAIL) | `npm run api:slow` | `API: http://127.0.0.1:3001 (700ms demo delay)` |
| Load test 10 VUs, 30 giây | `npm run test:load` | PASS khi API bình thường |
| Load test 50 VUs | `npm run test:load -- -e VUS=50` | PASS khi API bình thường |
| Load test thời gian khác | `npm run test:load -- -e DURATION=10s` | Chạy 10 giây |
| Test chức năng (E2E) | `npm run test:e2e` | 16 passed |
| Mở web để xem | `npm run dev` | Mở http://localhost:5173 |
| Kiểm tra build | `npm run build` | `✓ built` |

> Khi demo FAIL, terminal báo `failed`, `ERRO ... thresholds crossed` hoặc `npm error ... exit code 1/99`. Đây là **kết quả mong đợi**, không phải cài đặt hỏng.

---

### Demo 1 — Visual regression (Playwright)

Chỉ cần **1 terminal**. Không cần bật `npm run dev` trước, vì Playwright tự khởi động web.

```powershell
npm run test:visual          # 1. PASS: 3 passed
npm run test:visual:fail     # 2. FAIL có chủ đích: 3 failed
npm run report               # 3. Mở báo cáo xem ảnh khác nhau
                             # 4. Bấm Ctrl + C để tắt báo cáo
npm run test:visual          # 5. PASS trở lại: 3 passed
```

| Bước | Kết quả đúng | Giải thích |
|---|---|---|
| 1 | **3 passed** | Giao diện khớp với ảnh chuẩn |
| 2 | **3 failed**, khoảng 12.000 pixel khác nhau | Script chèn CSS đổi nút "Kiểm Tra Ngày" sang màu đỏ lúc chạy test (không sửa code gốc), Playwright phát hiện ra |
| 3 | Báo cáo có 3 test ✕ | Bấm vào tên test → phần **Image mismatch** → chọn **Diff / Actual / Expected / Side by side / Slider** để xem chỗ khác |
| 5 | **3 passed** | Không còn CSS màu đỏ, giao diện khớp lại |

3 test được chụp:

| Test | Ảnh chụp |
|---|---|
| `initial form` | Form lúc mới mở |
| `valid leap year result` | Sau khi bấm mẫu 29/02/2024 (hợp lệ, năm nhuận) |
| `invalid date result` | Sau khi bấm mẫu 29/02/2023 (không hợp lệ) |

> ⚠️ **Không chạy `npm run test:visual:update` sau khi demo FAIL.** Lệnh đó sẽ ghi đè ảnh chuẩn bằng ảnh nút đỏ.
> Báo cáo chỉ hiển thị **lần chạy gần nhất**. Chạy `test:visual` xong rồi mở `report` thì sẽ thấy 3 passed.

---

### Demo 2 — Performance testing (k6)

Cần **2 terminal**, cả hai đều phải đứng **đúng thư mục có `package.json`**.
Trong VS Code, bấm dấu **`+`** ở panel Terminal (hoặc `` Ctrl + Shift + ` ``) để mở thêm terminal.

#### 2a. PASS

**Terminal 1**: bật API, **để nguyên terminal này, không tắt, không gõ thêm gì**:

```powershell
npm run api
```

Phải thấy `API: http://127.0.0.1:3001 (normal)`. Có thể thử trên trình duyệt: http://127.0.0.1:3001/api/validate-date?day=29&month=2&year=2024

**Terminal 2**: chạy k6:

```powershell
npm run test:load                  # 10 người dùng ảo, 30 giây
npm run test:load -- -e VUS=50     # 50 người dùng ảo, 30 giây
```

Kết quả đúng (cả 3 ngưỡng có dấu ✓):

```
  █ THRESHOLDS
    checks
    ✓ 'rate==1' rate=100.00%
    http_req_duration
    ✓ 'p(95)<500' p(95)=3.97ms
    http_req_failed
    ✓ 'rate<0.01' rate=0.00%
```

Mỗi người dùng ảo (VU) gọi API khoảng 1 lần/giây với 3 trường hợp: 29/02/2024 (hợp lệ), 29/02/2023 (không hợp lệ), 31/04/2025 (không hợp lệ).
Script kiểm tra hai điều: API trả **HTTP 200**, và kết quả `isValid` đúng với từng ngày.

> Ngày không hợp lệ vẫn trả HTTP 200 với `"isValid": false`. HTTP 200 nghĩa là API xử lý yêu cầu thành công, không có nghĩa là ngày hợp lệ.

**Cách đọc kết quả**

| Chỉ số | Ý nghĩa | Ngưỡng |
|---|---|---|
| `http_req_duration` p(95) | 95% request phản hồi nhanh hơn mức này | < 500ms |
| `http_req_failed` | Tỷ lệ request lỗi (mất kết nối, HTTP 4xx/5xx) | < 1% |
| `checks` | Tỷ lệ kiểm tra đúng (HTTP 200 + kết quả đúng) | = 100% |
| `http_reqs` | Tổng số request đã gửi | (tham khảo) |

✓ là đạt, ✗ là không đạt. Chỉ cần một ngưỡng ✗ là k6 báo FAIL (`thresholds ... have been crossed`).

#### 2b. FAIL có chủ đích: API chậm

```powershell
# Terminal 1: bấm Ctrl + C để tắt API, rồi:
npm run api:slow

# Terminal 2:
npm run test:load
```

Kết quả: `http_req_duration` **✗** (p95 khoảng 700ms > 500ms). `checks` vẫn ✓ 100% vì kết quả vẫn đúng, chỉ chậm.

Khôi phục: ở terminal 1 bấm `Ctrl + C`, rồi chạy `npm run api`.

#### 2c. FAIL có chủ đích: server sập

```powershell
# Terminal 1: bấm Ctrl + C để tắt hẳn API

# Terminal 2:
npm run test:load
```

Kết quả: rất nhiều dòng `WARN Request Failed ... actively refused it`, sau đó `http_req_failed` **✗ 100%** và `checks` **✗ 0%**. k6 phát hiện server không phản hồi.

> Lưu ý khi trình bày:
> - Độ trễ 700ms là **cố ý thêm vào** để minh họa việc vi phạm tiêu chí hiệu năng, không phải bằng chứng hệ thống bị quá tải.
> - Tăng VUs từ 10 lên 50 chỉ minh họa việc tăng tải. Repo này **không** chứng minh khả năng mở rộng (scalability), vì không thay đổi tài nguyên hay số instance.

---

### Cấu trúc thư mục

```
src/date-validator.js        Logic kiểm tra ngày (web và API dùng chung)
src/main.js, index.html      Giao diện web
server/index.js              API cho k6 (cổng 3001), thêm --slow để chậm 700ms
tests/performance/load.js    Script k6 (VUS, DURATION, BASE_URL đổi được bằng -e)
tests/visual/                Visual test (ảnh chuẩn tạo trên từng máy)
tests/e2e/                   Test chức năng
scripts/visual-fail.js       Chạy visual test với CSS nút đỏ (VISUAL_DEMO=1)
playwright.config.ts         Cấu hình Playwright (tự bật web ở cổng 5173)
```

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `Could not read package.json ... C:\package.json` | Đứng sai thư mục (thường do ZIP tạo thư mục con) | `cd` vào thư mục có `package.json`, kiểm tra bằng `dir package.json` |
| `'node' / 'k6' / 'git' is not recognized` | Terminal mở trước khi cài xong | Đóng hết terminal và VS Code, mở lại |
| `running scripts is disabled on this system` | PowerShell chặn script của npm | Chạy một lần: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, chọn `Y` |
| `Executable doesn't exist ... headless_shell.exe` | Trình duyệt chưa tải xong | `npx playwright install chromium`; vẫn lỗi thì chạy thêm `npx playwright install chromium-headless-shell` |
| `Request to https://cdn.playwright.dev/... timed out` | Mạng chậm khi tải trình duyệt | `$env:PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT = "120000"` rồi cài lại |
| k6: `actively refused it`, `http_req_failed 100%` | Chưa bật API | Mở terminal khác (đúng thư mục), chạy `npm run api` |
| `EADDRINUSE ... 3001` | API đang chạy ở terminal khác | Dùng luôn terminal đó, hoặc `Ctrl + C` ở đó rồi chạy lại |
| `Port 5173 is already in use` | Cổng 5173 bị chương trình khác chiếm | Tắt chương trình đang dùng cổng 5173 |
| `A snapshot doesn't exist ... writing actual` | Chưa có ảnh chuẩn trên máy này | `npm run test:visual:update` |
| Visual test FAIL dù không sửa gì | Ảnh chuẩn tạo trên máy khác, hoặc đã đổi zoom/độ phân giải | Tạo lại: `npm run test:visual:update` |
| `esbuild ... install scripts not yet covered by allowScripts` | npm bản mới chặn script cài đặt | Thường bỏ qua được. Nếu Vite báo lỗi esbuild: `npm install-scripts approve esbuild` rồi `npm rebuild esbuild` |
| `npm audit` báo vulnerabilities | Cảnh báo bảo mật của thư viện dev | Bỏ qua được. **Không** chạy `npm audit fix --force` (dễ làm hỏng dự án) |

---

## Tài liệu tham khảo

- k6, bắt đầu: https://grafana.com/docs/k6/latest/get-started/
- k6, thresholds: https://grafana.com/docs/k6/latest/using-k6/thresholds/
- Playwright, visual comparisons: https://playwright.dev/docs/test-snapshots
- Playwright, cài đặt: https://playwright.dev/docs/intro
