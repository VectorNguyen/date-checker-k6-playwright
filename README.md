# Date Time Checker — k6 + 

## Chuẩn bị (Windows / PowerShell)

Cài Node.js LTS, mở thư mục này trong VS Code, Terminal > New Terminal.

```powershell
npm ci
npx playwright install chromium
winget install k6 --source winget
```

Mở lại terminal sau khi cài k6; kiểm tra `k6 version`.

## Chạy web

```powershell
npm run dev
```

Mở http://localhost:5173. Giữ terminal mở. Playwright tự mở server nếu chưa chạy.
Web dùng logic ở `src/date-validator.js`; API k6 cũng dùng cùng logic này. Web vẫn kiểm tra ngày tại trình duyệt như bản gốc.

## Demo 1 — Performance testing (k6)

Terminal 1:

```powershell
npm run api
```

Terminal 2:

```powershell
npm run test:load
k6 run -e VUS=50 tests/performance/load.js
```

Mỗi lần 30 giây, 10 hoặc 50 VUs. Script gọi API kiểm tra ngày thật trên máy, kiểm tra HTTP 200 và tính đúng của kết quả với ngày hợp lệ/không hợp lệ.
HTTP 200 biểu thị xử lý yêu cầu thành công; ngày không hợp lệ được trả trong `isValid: false`, không phải lỗi HTTP.

Đọc `http_req_duration` (p95), `http_req_failed`, `http_reqs`, `checks`.
Tiêu chí ví dụ: p95 < 500ms; tỷ lệ lỗi HTTP < 1%; checks = 100%.

### Demo FAIL có chủ đích

Dừng API tại terminal 1 bằng Ctrl+C rồi chạy:

```powershell
npm run api:slow
```

Terminal 2 chạy `npm run test:load` lại. API thêm độ trễ nhân tạo 700ms, nên p95 không đạt ngưỡng 500ms.
Đây là minh họa vi phạm tiêu chí hiệu năng, không phải bằng chứng hệ thống bị quá tải.
Khôi phục: Ctrl+C rồi `npm run api`.
Tăng VUs minh họa load; repo này không chứng minh scalability vì chưa thay đổi tài nguyên/instance.

## Demo 2 — Visual regression (Playwright screenshots)

Tạo ảnh chuẩn trên chính máy của bạn (Windows/Linux có thể render khác nhau):

```powershell
npm run test:visual:update
```

Kiểm tra ba ảnh PNG trong `tests/visual/date-checker.spec.ts-snapshots/` trước khi dùng làm ảnh chuẩn.

```powershell
npm run test:visual
```

Dự kiến 3 PASS: form ban đầu, ngày năm nhuận hợp lệ, ngày không hợp lệ.

```powershell
npm run test:visual:fail
npm run report
```

Dự kiến 3 FAIL: script thêm CSS đổi nút kiểm tra thành màu đỏ trong browser. Mở chi tiết test trong báo cáo để xem Expected / Actual / Diff.
Không sửa file giao diện gốc. Chạy `npm run test:visual` lần nữa để trở về PASS.
**Không update ảnh chuẩn khi chạy demo FAIL.** Chỉ cập nhật khi giao diện mới đã được duyệt.
Fonts dùng fallback hệ thống, không tải Google Fonts; animation tắt trong test để ổn định ảnh.

## E2E có sẵn

```powershell
npm run test:e2e
npm run build
```

## Tạo repository GitHub riêng

Tạo repo trống `date-checker-k6-playwright` tại https://github.com/new (không thêm README/.gitignore).
Nếu dùng ZIP (không có .git):

```powershell
git init -b main
git add .
git commit -m "Add Date Checker k6 and Playwright demos"
git remote add origin https://github.com/VectorNguyen/date-checker-k6-playwright.git
git push -u origin main
```

Không push vào repo gốc của bạn nhóm.

## Tài liệu học

- https://grafana.com/docs/k6/latest/get-started/
- https://grafana.com/docs/k6/latest/using-k6/thresholds/
- https://playwright.dev/docs/test-snapshots
