# 互動修復與部署紀錄（2026-11-17）

## 修改
- `zhuyin_adventure_v3_content_review/assets/app.js`：委派點擊事件新增明確的頁面動作白名單，交由既有 navigate() 切換。修復區域卡片「前往探索」「故事任務」及四個遊戲快捷入口。
- `zhuyin_adventure_v3_content_review/index.html`：三個完全相同的 V3 教學內容連結合併為一個。
- `tests/navigation.cjs`：新增可重跑的瀏覽器回歸測試。
- `INTERACTION_FIX.md`：本修復與部署說明。

## 根因與驗證
正式站修復前：點擊 data-action=symbols 及 story，主畫面仍為「探險地圖」，V3 連結數為 3，沒有 JavaScript 例外。原因是點擊處理器未處理這些導航動作，而非檔案載入失敗。

已在獨立 Chrome、本機 HTTP 站台 `/zhuyin/` 前綴下通過：
- 七個主導航、兩種區域卡片導航、四個遊戲快捷入口。
- 尋寶正確/錯誤答案及換題。
- 圖鑑前往書寫、符號切換、實際繪圖、復原與清除。
- 拼音換題、故事前後切換、目錄選擇、參考答案及完成紀錄。
- 家長開放第八區後共 37 個符號、32 個故事任務。
- 認讀/書寫紀錄、重新整理後持續保留、JSON/CSV 下載、JSON 匯入、取消重設保留紀錄。
- V3 連結僅一個，首頁教材/課程/PDF 連結 HTTP 200、V3 內容頁及返回遊戲。
- 手機 390×844 尺寸導航；上述流程沒有 pageerror 或 console.error。

測試指令（需 Node.js、Playwright 與 Chrome）：
`CHROME_CHANNEL=chrome NODE_PATH=/path/to/node_modules node tests/navigation.cjs`
未指定 CHROME_CHANNEL 時使用 Playwright 的 Chromium。

## 資料保留與範圍
未更動 localStorage 鍵 `zhuyin-explorer-v2`、資料格式、37 符號課程、題庫或 PDF。測試使用獨立瀏覽器環境，不接觸使用者既有進度。
保持相同 GitHub Pages 網域及路徑，原瀏覽器學習進度可繼續讀取。正式使用時不要清除網站資料。
本次只驗證互動及部署路徑，沒有全面校訂教學例字、注音、語音、筆順或教材 PDF；原有未全面重審的說明仍有效。

## 部署
1. 將上述修正提交至 `Iting0901/zhuyin` 的 main 分支。
2. GitHub → Settings → Pages：維持 Deploy from a branch、main、/(root)。若目前已正確設定，毋須更改。
3. 等待 GitHub Pages 的部署工作成功，再開啟 https://iting0901.github.io/zhuyin/ 。
4. 重新整理（必要時強制重新載入，但不要清除網站資料），點新手訓練營的兩個按鈕及四個遊戲快捷入口；確認 V3 連結只剩一個。
5. 若要回復，revert 此次修正提交，不需要清除本機進度。
