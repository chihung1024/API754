# API RP 754 製程安全事件篩選

此專案為靜態前端頁面，提供 API RP 754 製程安全事件分級的快速篩選與提示資訊。

## Cloudflare Pages 自動部署

已內建 GitHub Actions 部署流程，推送到 `main` 分支會自動部署到 Cloudflare Pages。

### 事前準備

1. 在 Cloudflare Pages 建立專案（記下專案名稱）。
2. 在 GitHub Repo 的 Secrets 設定：
   - `CLOUDFLARE_API_TOKEN`：需具備 Pages 部署權限。
   - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 帳號 ID。
3. 若你的 Pages 專案名稱不同，請修改 `.github/workflows/cloudflare-pages.yml` 中的 `--project-name` 值。

### 手動部署

可在 GitHub Actions 中手動觸發 `Deploy to Cloudflare Pages` workflow。
