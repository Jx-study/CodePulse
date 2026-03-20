export default {
  "welcome": "歡迎來到 CodePulse!",
  "description": "您的終極程式碼分析工具。",
  "language_switcher": "語言",
  "home": "首頁",
  "features": "功能特色",
  "demo": "線上體驗",
  "docs": "文件",
  "about": "關於我們",
  "dashboardLabel": "學習導覽",
  "login": "登入",
  "register": "註冊",

  "verifyEmail": {
    "title": "驗證您的信箱",
    "subtitle": "驗證碼已寄送至",
    "codePlaceholder": "請輸入 6 位驗證碼",
    "submit": "驗證",
    "resend": "重新發送驗證碼",
    "backToRegister": "返回重新註冊",
    "timeLeft": "驗證碼將在 {{minutes}}:{{seconds}} 後過期",
    "expired": "驗證碼已過期",
    "submitting": "驗證中...",
    "resending": "發送中...",
    "errors": {
      "INVALID_OR_EXPIRED_CODE": "驗證碼無效或已過期",
      "EMAIL_ALREADY_EXISTS": "此 Email 已被註冊",
      "MISSING_FIELDS": "請填寫所有必要欄位",
      "MAIL_ERROR": "驗證碼寄送失敗，請稍後再試",
      "DEFAULT": "驗證失敗，請稍後再試"
    }
  },

  "breadcrumb": {
    "dashboard": "學習導覽",
    "backToDashboard": "回到學習導覽"
  },

  "hero": {
    "title": "CodePulse",
    "subtitle": "程式執行視覺化平台",
    "description": {
      "main": "結合靜態分析與動態追蹤的程式執行視覺化平台",
      "sub": "讓程式運作變得一目了然,讓學習除錯更加高效"
    },
    "cta": "立即體驗"
  },

  "features_section": {
    "title": "核心功能",
    "interactive_flowchart": {
      "title": "互動式流程圖",
      "description": "將程式執行流程以直觀的流程圖呈現，支援斷點設置與逐步執行，讓複雜的程式邏輯一目了然。"
    },
    "memory_visualization": {
      "title": "記憶體視覺化",
      "description": "即時顯示變數狀態、記憶體引用關係，幫助理解 list/dict 傳址行為與函式間的資料傳遞。"
    },
    "smart_summary": {
      "title": "智能程式摘要",
      "description": "自動分析程式結構，生成清晰的執行摘要與說明，讓初學者快速掌握程式運作原理。"
    },
    "dynamic_tracking": {
      "title": "動態追蹤技術",
      "description": "結合 AST 靜態分析與 sys.settrace 動態追蹤，提供精確的程式執行分析。"
    },
    "breakpoint_system": {
      "title": "斷點播放系統",
      "description": "支援程式執行的暫停、播放、回溯功能，便於深入分析特定程式段落。"
    },
    "teaching_interface": {
      "title": "教學友好介面",
      "description": "專為教學場景設計，支援師生互動討論，讓程式教學更加生動有效。"
    }
  },

  "demo_section": {
    "title": "程式執行示範",
    "subtitle": "體驗 CodePulse 如何讓程式執行過程變得清晰可見",
    "current_line": "目前執行行",
    "analysis": "即時分析",
    "analysis_text": "目前在第一層迴圈，i = 0，準備開始氣泡排序的第一輪比較",
    "cta": "開始使用 CodePulse"
  },

  "algorithms_section": {
    "title": "資料結構與演算法",
    "learn_more": "了解更多",
    "difficulty_levels": {
      "1": "初學者",
      "2": "簡單",
      "3": "中等",
      "4": "進階",
      "5": "專家"
    }
  },

  "algorithms": {
    "linked_list": {
      "name": "鏈結串列",
      "description": "一種線性資料結構，元素儲存在節點中，每個節點指向序列中的下一個節點。"
    },
    "stack": {
      "name": "堆疊",
      "description": "一種後進先出 (LIFO) 的資料結構，支援在一端進行推入和彈出操作。"
    },
    "queue": {
      "name": "佇列",
      "description": "一種先進先出 (FIFO) 的資料結構，支援入列和出列操作。"
    },
    "bubble_sort": {
      "name": "氣泡排序",
      "description": "一種簡單的比較排序演算法，重複地走訪過要排列的數列，一次比較兩個元素，如果它們的順序錯誤就把它們交換過來。"
    },
    "selection_sort": {
      "name": "選擇排序",
      "description": "一種排序演算法，重複地從未排序部分選擇最小元素並將其放在已排序部分的末尾。"
    },
    "insertion_sort": {
      "name": "插入排序",
      "description": "一種排序演算法，通過將元素逐一插入到正確位置來建立最終的排序陣列。"
    },
    "quick_sort": {
      "name": "快速排序",
      "description": "一種高效的分治排序演算法，通過選擇一個基準元素並將陣列分割成兩部分來進行排序。"
    },
    "merge_sort": {
      "name": "合併排序",
      "description": "一種穩定的分治排序演算法，將陣列分成兩半分別排序，然後將已排序的部分合併起來。"
    },
    "binary_search": {
      "name": "二分搜尋",
      "description": "一種在已排序陣列中查找特定元素的高效搜尋演算法，通過重複將搜尋區間對半分割來縮小搜尋範圍。"
    },
    "linear_search": {
      "name": "線性搜尋",
      "description": "一種簡單的搜尋演算法，按順序檢查列表中的每個元素，直到找到目標元素。"
    },
    "dfs": {
      "name": "深度優先搜尋",
      "description": "一種圖形遍歷演算法，在回溯之前會盡可能深入地沿著每個分支進行探索。"
    },
    "bfs": {
      "name": "廣度優先搜尋",
      "description": "一種圖形遍歷演算法，在移動到下一層深度的頂點之前，會先探索當前深度的所有頂點。"
    },
    "dijkstra": {
      "name": "戴克斯特拉演算法",
      "description": "一種用於尋找圖中具有非負邊權重的節點之間最短路徑的演算法。"
    },
    "array": {
      "name": "陣列",
      "description": "一種連續記憶體區塊的資料結構，儲存相同型別的元素，可透過索引以 O(1) 時間隨機存取。"
    },
    "binary_tree": {
      "name": "二元樹",
      "description": "一種階層式資料結構，每個節點最多有兩個子節點（左子節點和右子節點）。"
    },
    "bst": {
      "name": "二元搜尋樹",
      "description": "一種二元樹，左子樹節點均小於根節點，右子樹節點均大於根節點，可在 O(log n) 時間內完成搜尋。"
    },
    "graph": {
      "name": "圖",
      "description": "由頂點（節點）和邊組成的非線性資料結構，用於表示網路關係與連接。"
    },
    "prefix_sum": {
      "name": "前綴和",
      "description": "預先計算累計加總的技巧，經 O(n) 預處理後可在 O(1) 時間內回答區間求和查詢。"
    },
    "sliding_window": {
      "name": "滑動視窗",
      "description": "在序列上維護一個動態範圍的技巧，可在 O(n) 時間內高效解決子陣列或子字串問題。"
    },
    "knapsack": {
      "name": "背包問題",
      "description": "經典動態規劃問題，在重量限制內從給定物品中選取，使總價值最大化。"
    },
    "n_queens": {
      "name": "N 皇后",
      "description": "回溯法問題，在 N×N 棋盤上放置 N 個皇后，使任意兩個皇后彼此不互相攻擊。"
    },
    "categories": {
      "data-structures": "資料結構",
      "sorting": "排序",
      "searching": "搜尋",
      "graph": "圖論"
    }
  },

  "footer": {
    "tagline": "將抽象演算法化為視覺故事，讓程式設計與除錯成為直觀且引人入勝的學習旅程。",
    "resources": {
      "title": "學習資源",
      "tutorial": "使用教學",
      "examples": "範例程式",
      "faq": "常見問題"
    },
    "contact": {
      "title": "聯絡我們",
      "github": "GitHub",
      "support": "技術支援",
      "feedback": "意見回饋"
    },
    "copyright": "© 2025 CodePulse。 本項目採用 MIT 許可證。| 專為程式學習而設計。"
  },

  "validation": {
    "username": {
      "required": "請輸入用戶名",
      "min": "用戶名至少需要 3 個字符",
      "max": "用戶名最多 15 個字符",
      "invalid": "用戶名只能包含字母、數字和底線"
    },
    "email": {
      "required": "請輸入電子郵件",
      "invalid": "請輸入有效的電子郵件格式"
    },
    "password": {
      "required": "請輸入密碼",
      "min": "密碼至少需要 8 個字符",
      "max": "密碼最多 20 個字符",
      "uppercase": "密碼必須包含大寫字母",
      "lowercase": "密碼必須包含小寫字母",
      "digit": "密碼必須包含數字",
      "symbol": "密碼必須包含符號 (!@#$%^&*_-+=.,?)",
      "invalid_chars": "密碼包含不允許的字符"
    },
    "confirmPassword": {
      "required": "請確認密碼",
      "mismatch": "密碼不一致"
    },
    "displayName": {
      "required": "顯示名稱不可為空",
      "max": "顯示名稱最多 30 個字符"
    },
    "oldPassword": {
      "required": "請輸入目前的密碼"
    },
    "loginIdentifier": {
      "required": "請輸入用戶名或電子郵件"
    }
  },

  "tech": {
    "python": "Python",
    "javascript": "JavaScript",
    "react": "React",
    "flask": "Flask",
    "api": "API",
    "leetcode": "LeetCode",
    "github": "GitHub",
    "docker": "Docker"
  }
} as const;
