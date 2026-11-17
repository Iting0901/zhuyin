# 寶可夢童趣改版（2026-11-17）

## 體驗變更
- 首頁改成奶油紙色、草地、山丘、符號卡與寶可夢角色的冒險場景，提供可立即開始的遊戲入口。
- 五位可選夥伴：皮卡丘、伊布、妙蛙種子、小火龍、傑尼龜。選擇會保存，並顯示於主要遊戲頁面。
- 八區各有寶可夢出場。各區探索會開啟該區符號，故事入口會選中該區第一個任務。
- 為既有 32 任務新增 32 段角色故事情境；既有練習指示保留在「給陪玩的家長」提示中。
- 尋寶答題加入夥伴鼓勵文字；完成任務會從既有 journal 顯示區域探險足跡。
- 教材資源移到頁尾，保留一個 V3 內容連結。手機可橫向滑動選夥伴與導航。
- 首頁 CSS/JS 加上資源版本，讓更新後的 HTML 能載入新版互動與樣式。
- 角色 PNG 檔保存在網站內，採相對路徑載入，來源與權利說明見 assets/pokemon/ATTRIBUTION.md。

## 修改位置
- `index.html`（repository 根目錄）：補上相對路徑圖示。
- `zhuyin_adventure_v3_content_review/index.html`：新版首頁框架、品牌、資源與來源說明。
- `zhuyin_adventure_v3_content_review/assets/app.js`：夥伴選擇、冒險地圖、角色故事、遊戲回饋與區域導航。
- `zhuyin_adventure_v3_content_review/assets/style.css`：新版視覺與響應版面；尊重減少動態效果偏好。
- `zhuyin_adventure_v3_content_review/assets/pokemon/`、`assets/favicon.svg`：角色圖像、來源說明與網站圖示。
- `zhuyin_adventure_v3_content_review/content_v3.html`、`curriculum.html`：僅補上圖示，教學內容未改。
- `tests/navigation.cjs`：更新導航測試，新增角色、故事、圖像、舊資料相容及版面測試。

## 已通過驗證
Chrome 本機 `/zhuyin/` 子路徑：七個主要導航、四個遊戲入口、各區探索與故事入口、答題、書寫繪圖/復原/清除、換符號、拼音換題、故事切換與完成紀錄、家長開放區域、JSON/CSV 匯出、JSON 匯入、取消重設、重新整理後保留資料。

核對 37 個符號、32 個任務及其新增故事均存在，所有角色圖片能解碼；390/768/1280 像素寬度無頁面水平溢出；測試流程沒有主控台錯誤或資源載入失敗。

另以舊版資料格式預置紀錄，確認載入新版與選夥伴後，原本的 stage、records、journal、discoveries、attempts 保留。

## 保留事項
未更動 `assets/data.js`、課程 JSON、教學 PDF 或儲存鍵 `zhuyin-explorer-v2`。只新增選填 companion 欄位。舊紀錄沒有此欄位時，畫面使用皮卡丘作為預設夥伴。

探險足跡只代表完成過任務；認讀、書寫與拼音能力仍由家長觀察記錄。本次新增故事情境與童趣介面，未宣稱原有教學內容已全面校訂。

## 部署與回復
沿用 GitHub Pages：main 分支、/(root)，網址 https://iting0901.github.io/zhuyin/ 。推送後等待 Pages 部署成功，再重新整理。毋須清除網站資料或更換儲存位置。可 revert 此次提交回復介面，舊學習紀錄不需刪除。
