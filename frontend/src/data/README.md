# 資料結構與演算法：邊界與錯誤的呈現規則

新增或修改資料結構、演算法時，邊界情況（滿了、空了、索引越界、重複、不存在、輸入被調整）請依本文處理，讓所有結構的行為一致。

## 核心規則

1. **虛擬碼裡有這個檢查，就要在畫面上演出來**：對應的虛擬碼行高亮，並以 toast 顯示說明。不另做紅色箱子、guard slot 之類的動畫。
2. **虛擬碼裡沒有這個檢查，就在呼叫前 toast 擋下**，不產生動畫。
3. **不可以靜默改使用者的輸入**（排序、截斷、正規化、索引修正）。改了就要用 info toast 告知。

## 檢查放在哪一層

| 類型 | 例子 | 放哪裡 | 結果 |
| --- | --- | --- | --- |
| 輸入格式 | 欄位空白、不是數字、BFS 起點不存在、區間不合法 | ActionBar，呼叫前 | `toast.warning`，不執行 |
| 資料狀態，虛擬碼有這行檢查 | 滿了、空了、索引越界、重複、節點不存在 | actionHandler 回傳 guard 步驟 | 虛擬碼高亮加 toast |
| 資料狀態，虛擬碼沒有這行檢查 | 索引越界但虛擬碼沒寫 | actionHandler，`context.toast.warning` 後回傳 `null`（動作不執行） | 只 toast |
| 通用後備 | `maxNodes`、空資料 | `Tutorial.tsx` | 只給沒有 guard 的結構用 |

同一種檢查只放一個地方。ActionBar 已經擋掉的輸入，handler 不必再檢查（那會變成永遠不會執行的程式碼）。反過來，要演出 guard 步驟的檢查，ActionBar 不可以事先擋掉，否則步驟永遠不會播放。

## 怎麼寫一個 guard 步驟

1. **handler**：不要回傳 `null`（那表示「沒有結果」，動作整個不會執行，也就沒有步驟可以播放），改回傳不改變資料的結果，並帶上足以讓模擬器判斷的參數（例如 `overflow: true`、`guardTag`、`empty: true`）。
2. **模擬器／步驟產生器**：產生對應的步驟，`elements` 維持原本的資料不變，`actionTag` 設成 guard 的 tag，並設 `warn: true`。範例：`Stack/traceToSteps.ts` 的 `GUARD_ERROR_TAGS`、`Graph/tags.ts` 的 `GUARD_TAGS`。
3. **虛擬碼對應表**：在 `codeConfig.pseudo.mappings` 把 guard tag 對到虛擬碼裡那行檢查。
4. **i18n**：步驟的 `description` 就是 toast 的文字，所以只要寫一組中英文說明，不需要另外的 toast 文字。

播放到 `warn` 步驟時，`Tutorial.tsx` 會以 `toast.warning` 顯示該步驟的 description；`info` 步驟用 `toast.info`。toast 會在步驟成為目前步驟時出現，所以可以和高亮同步。

### `warn` 與 `info`

兩者的差別是**操作有沒有被擋下**：

- `warn`：操作被擋下，資料沒有任何改變，對應虛擬碼的 `Return Error`（滿了、空了、越界、重複、不存在）。toast 是警告樣式。
- `info`：操作沒有失敗，只是輸入被自動調整，或是目標不存在／結構是空的，所以回傳了預設結果（`null`、`-1`、空串列、`False`）。toast 是一般提示樣式。
  - 輸入被調整：Array 的插入索引超過長度改插在尾端、載入時自動排序、Trie 載入時正規化單字。
  - 回傳預設結果：Stack／Queue 的 `peek` 在空的時候、Graph 取鄰居／度數／是否相鄰遇到不存在的節點。
  - 一般的「找不到」搜尋結果（例如陣列搜尋沒有這個值）是正常的查詢結果，不需要 toast。
- 非步驟層的提示用 `context.toast.info`／`context.toast.warning`，意義相同。

## 結構設定旗標

| 旗標 | 設在 | 意義 |
| --- | --- | --- |
| `hasCapacityGuard` | `LevelImplementationConfig` | 虛擬碼有容量檢查。達到 `maxNodes` 時仍會執行並播放 guard 步驟；沒設的結構會被 `Tutorial.tsx` 直接 toast 擋下。 |
| `hasEmptyGuard` | `LevelImplementationConfig` | 虛擬碼自己處理空資料（有空檢查，或空資料時走原本的找不到流程）。`handleCustomAction` 對 delete／peek 空資料不再用通用 toast 攔下。 |

## Tag 命名

guard 的 tag 以「操作加原因」命名，同一個結構內保持一致：

- 檢查步驟：`<OP>_CHECK_<條件>`，例如 `PUSH_CHECK_FULL`。
- 失敗：`<OP>_ERROR`，或更具體的後綴：`_EMPTY`、`_MISSING`、`_DUPLICATE`、`_NOT_FOUND`、`_MISSING_VERTEX`。
- 輸入被調整：`<OP>_CLAMP`，搭配 `info`。

每個步驟（tag）都應該對應虛擬碼裡的某一行或某一段，這是 tag 存在的目的：讓高亮跟著步驟走。不要為了動畫效果新增在虛擬碼裡沒有對應行的步驟。舊的 `*_DISCARD` 就是反例：它只是為了讓紅色箱子飛走，和 `*_ERROR` 對到同一行，現在已經移除。

## 虛擬碼的回傳慣例

- 會改變結構的操作失敗：`Return Error`（Python 用 `raise`）。虛擬碼不要寫 `Alert`，那是 UI 行為。
- 唯讀查詢：回傳值的用 `null`（例如 `peek`），回傳索引的用 `-1`（例如搜尋找不到）。
- 虛擬碼的 `Return Error` 在畫面上就是一個 guard 步驟。

## 每個 guard 行都要亮過

虛擬碼裡的每一行 `If`，在正常操作的流程中至少要亮過一次（條件成立、不成立都算），使用者才看得到程式「先檢查了」。

- 步驟的 tag 一對多行：把檢查那行加進該步驟的對應。
- 沒有合適的步驟時：新增一個檢查步驟（例如鏈結串列的 `INSERT_TAIL_CHECK_HEAD`）。
- 虛擬碼行號改了，對應表要一起改。

`src/data/__tests__/litGuardLines.test.ts` 會檢查鏈結串列所有 `If` 行都亮過，以及其他結構特定的 guard 行。新增結構時請比照加上。

## 新增結構的檢查清單

- [ ] 每個 guard 都有 guard 步驟（`warn`）並對到虛擬碼那一行。
- [ ] ActionBar 只做輸入格式驗證，不重複 handler 的檢查。
- [ ] handler 的每個動作都能從 ActionBar 觸發，沒有永遠執行不到的分支。
- [ ] 沒有靜默修改輸入；有調整就用 `info`。
- [ ] 需要時設定 `hasCapacityGuard`／`hasEmptyGuard`。
- [ ] 虛擬碼、Python、說明文字（中英文）三者一致。
- [ ] 用 `src/data/__tests__/harness.ts` 的 `mountStructure` 寫測試，涵蓋每種 guard（範例：`Graph/__tests__/handlerGuards.test.ts`）。它會用真正的 `useVisualizationLogic` 和 `Tutorial.tsx` 實際送出的 payload 呼叫，toast 也是播放步驟時真的觸發的。不要自己組 `type` 或手動補參數讓測試通過，那樣測不出 handler 與步驟之間接錯的問題。`Tutorial.tsx` 的 handler 改了，`harness.ts` 要一起改。
