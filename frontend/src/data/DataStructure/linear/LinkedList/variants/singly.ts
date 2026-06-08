import type { CodeConfig } from "@/types";
import type { LinkedListVariant } from "./types";
import { createLinkedListSteps } from "./createLinkedListSteps";

const TAGS = {
  INSERT_HEAD_START: "SGL_INSERT_HEAD_START",
  INSERT_HEAD_CREATE: "SGL_INSERT_HEAD_CREATE",
  INSERT_HEAD_LINK: "SGL_INSERT_HEAD_LINK",
  INSERT_HEAD_LINK_PREV: "SGL_INSERT_HEAD_LINK_PREV",
  INSERT_HEAD_UPDATE: "SGL_INSERT_HEAD_UPDATE",
  INSERT_HEAD_UPDATE_ISNULL: "SGL_INSERT_HEAD_UPDATE_ISNULL",
  INSERT_HEAD_UPDATE_NOTNULL: "SGL_INSERT_HEAD_UPDATE_NOTNULL",
  INSERT_HEAD_UPDATE_TAIL: "SGL_INSERT_HEAD_UPDATE_TAIL",
  INSERT_HEAD_END: "SGL_INSERT_HEAD_END",
  INSERT_TAIL_START: "SGL_INSERT_TAIL_START",
  INSERT_TAIL_TRAVERSE: "SGL_INSERT_TAIL_TRAVERSE",
  INSERT_TAIL_CREATE: "SGL_INSERT_TAIL_CREATE",
  INSERT_TAIL_UPDATE_ISNULL_TRUE: "SGL_INSERT_TAIL_UPDATE_ISNULL_TRUE",
  INSERT_TAIL_CREATE_NEW_NODE_ISNULL: "SGL_INSERT_TAIL_CREATE_NEW_NODE_ISNULL",
  INSERT_TAIL_UPDATE_HEAD_ISNULL: "SGL_INSERT_TAIL_UPDATE_HEAD_ISNULL",
  INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL: "SGL_INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL",
  INSERT_TAIL_LINK: "SGL_INSERT_TAIL_LINK",
  INSERT_TAIL_LINK_PREV: "SGL_INSERT_TAIL_LINK_PREV",
  INSERT_TAIL_POINTER_MOVE: "SGL_INSERT_TAIL_POINTER_MOVE",
  INSERT_TAIL_END: "SGL_INSERT_TAIL_END",
  INSERT_INDEX_START: "SGL_INSERT_INDEX_START",
  INSERT_INDEX_IFZERO: "SGL_INSERT_INDEX_IFZERO",
  INSERT_INDEX_IFTAIL: "SGL_INSERT_INDEX_IFTAIL",
  INSERT_INDEX_TRAVERSE: "SGL_INSERT_INDEX_TRAVERSE",
  INSERT_INDEX_CREATE: "SGL_INSERT_INDEX_CREATE",
  INSERT_INDEX_LINK: "SGL_INSERT_INDEX_LINK",
  INSERT_INDEX_LINK_PREV: "SGL_INSERT_INDEX_LINK_PREV",
  INSERT_INDEX_LINK_NEW_NEXT: "SGL_INSERT_INDEX_LINK_NEW_NEXT",
  INSERT_INDEX_LINK_NEXT_PREV: "SGL_INSERT_INDEX_LINK_NEXT_PREV",
  INSERT_INDEX_LINK_CURRENT_NEXT: "SGL_INSERT_INDEX_LINK_CURRENT_NEXT",
  INSERT_INDEX_LINK_NEW_PREV: "SGL_INSERT_INDEX_LINK_NEW_PREV",
  INSERT_INDEX_UPDATE_TAIL: "SGL_INSERT_INDEX_UPDATE_TAIL",
  INSERT_INDEX_END: "SGL_INSERT_INDEX_END",
  DELETE_HEAD_START: "SGL_DELETE_HEAD_START",
  DELETE_HEAD_CHECK: "SGL_DELETE_HEAD_CHECK",
  DELETE_HEAD_UPDATE_HEAD: "SGL_DELETE_HEAD_UPDATE_HEAD",
  DELETE_HEAD_UPDATE_PREV: "SGL_DELETE_HEAD_UPDATE_PREV",
  DELETE_HEAD_UPDATE_TAIL: "SGL_DELETE_HEAD_UPDATE_TAIL",
  DELETE_HEAD_FREE: "SGL_DELETE_HEAD_FREE",
  DELETE_HEAD_END: "SGL_DELETE_HEAD_END",
  DELETE_TAIL_START: "SGL_DELETE_TAIL_START",
  DELETE_TAIL_ISNEXTNULL: "SGL_DELETE_TAIL_ISNEXTNULL",
  DELETE_TAIL_ISNEXTNULL_REMOVE: "SGL_DELETE_TAIL_ISNEXTNULL_REMOVE",
  DELETE_TAIL_TRAVERSE: "SGL_DELETE_TAIL_TRAVERSE",
  DELETE_TAIL_UNLINK: "SGL_DELETE_TAIL_UNLINK",
  DELETE_TAIL_SINGLE: "SGL_DELETE_TAIL_SINGLE",
  DELETE_TAIL_END: "SGL_DELETE_TAIL_END",
  DELETE_INDEX_START: "SGL_DELETE_INDEX_START",
  DELETE_INDEX_IFZERO: "SGL_DELETE_INDEX_IFZERO",
  DELETE_INDEX_IFTAIL: "SGL_DELETE_INDEX_IFTAIL",
  DELETE_INDEX_TRAVERSE: "SGL_DELETE_INDEX_TRAVERSE",
  DELETE_INDEX_UNLINK: "SGL_DELETE_INDEX_UNLINK",
  DELETE_INDEX_END: "SGL_DELETE_INDEX_END",
  SEARCH_START: "SGL_SEARCH_START",
  SEARCH_COMPARE: "SGL_SEARCH_COMPARE",
  SEARCH_FOUND: "SGL_SEARCH_FOUND",
  SEARCH_NEXT: "SGL_SEARCH_NEXT",
  SEARCH_NOT_FOUND: "SGL_SEARCH_NOT_FOUND",
} as const;

const codeConfig: CodeConfig = {
  pseudo: {
    content: `Class Node:
    Data:
      value ← null
      next ← null

    Class LinkedList:
      Data:
        head ← null

      Procedure insertAtHead(value):
        newNode ← new Node(value)
        newNode.next ← head
        head ← newNode
      End Procedure

      Procedure insertAtTail(value):
        If head = null Then
          newNode ← new Node(value)
          head ← newNode
          Return
        End If
        current ← head
        While current.next ≠ null Do
          current ← current.next
        End While
        newNode ← new Node(value)
        current.next ← newNode
      End Procedure

      Procedure insertAtIndex(index, value):
        If index = 0 Then
          insertAtHead(value)
          Return
        End If
        current ← head
        For i ← 0 To index - 1 Do
          current ← current.next
        End For
        newNode ← new Node(value)
        newNode.next ← current.next
        current.next ← newNode
      End Procedure

      Procedure deleteAtHead():
        If head = null Then Return
        head ← head.next
      End Procedure

      Procedure deleteAtTail():
        If head = null Then Return
        If head.next = null Then
          head ← null
          Return
        End If
        prev ← null
        current ← head
        While current.next ≠ null Do
          prev ← current
          current ← current.next
        End While
        prev.next ← null
      End Procedure

      Procedure deleteAtIndex(index):
        If index = 0 Then
          deleteAtHead()
          Return
        End If
        prev ← null
        current ← head
        For i ← 0 To index Do
          If i = index Then Break
          prev ← current
          current ← current.next
        End For
        prev.next ← current.next
      End Procedure

      Procedure search(value):
        current ← head
        index ← 0
        While current ≠ null Do
          If current.value = value Then Return index
          current ← current.next
          index ← index + 1
        End While
        Return -1
      End Procedure`,
    mappings: {
      [TAGS.INSERT_HEAD_START]: [10],
      [TAGS.INSERT_HEAD_CREATE]: [11],
      [TAGS.INSERT_HEAD_LINK]: [12],
      [TAGS.INSERT_HEAD_UPDATE]: [13],
      [TAGS.INSERT_HEAD_END]: [14],

      [TAGS.INSERT_TAIL_START]: [16],
      [TAGS.INSERT_TAIL_UPDATE_ISNULL_TRUE]: [17],
      [TAGS.INSERT_TAIL_CREATE_NEW_NODE_ISNULL]: [18],
      [TAGS.INSERT_TAIL_UPDATE_HEAD_ISNULL]: [19],
      [TAGS.INSERT_TAIL_TRAVERSE]: [22, 23, 24, 25],
      [TAGS.INSERT_TAIL_CREATE]: [26],
      [TAGS.INSERT_TAIL_LINK]: [27],
      [TAGS.INSERT_TAIL_END]: [28],

      [TAGS.INSERT_INDEX_START]: [30],
      [TAGS.INSERT_INDEX_IFZERO]: [30, 31, 32],
      [TAGS.INSERT_INDEX_TRAVERSE]: [35, 36, 37, 38],
      [TAGS.INSERT_INDEX_CREATE]: [39],
      [TAGS.INSERT_INDEX_LINK_NEW_NEXT]: [40],
      [TAGS.INSERT_INDEX_LINK_CURRENT_NEXT]: [41],
      [TAGS.INSERT_INDEX_END]: [42],

      [TAGS.DELETE_HEAD_START]: [44],
      [TAGS.DELETE_HEAD_CHECK]: [45],
      [TAGS.DELETE_HEAD_UPDATE_HEAD]: [46],
      [TAGS.DELETE_HEAD_FREE]: [47],
      [TAGS.DELETE_HEAD_END]: [47],

      [TAGS.DELETE_TAIL_START]: [48],
      [TAGS.DELETE_TAIL_ISNEXTNULL]: [51],
      [TAGS.DELETE_TAIL_ISNEXTNULL_REMOVE]: [52],
      [TAGS.DELETE_TAIL_TRAVERSE]: [55, 56, 57, 58, 59],
      [TAGS.DELETE_TAIL_UNLINK]: [61],
      [TAGS.DELETE_TAIL_END]: [62],

      [TAGS.DELETE_INDEX_START]: [63],
      [TAGS.DELETE_INDEX_IFZERO]: [64, 65, 66],
      [TAGS.DELETE_INDEX_TRAVERSE]: [69, 70, 71, 72, 73, 74, 75],
      [TAGS.DELETE_INDEX_UNLINK]: [76],
      [TAGS.DELETE_INDEX_END]: [77],

      [TAGS.SEARCH_START]: [78],
      [TAGS.SEARCH_COMPARE]: [82, 84, 85],
      [TAGS.SEARCH_FOUND]: [83],
      [TAGS.SEARCH_NEXT]: [83, 84, 85],
      [TAGS.SEARCH_NOT_FOUND]: [86, 87],
    },
  },
  python: {
    content: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, value):
        new_node = Node(value)
        new_node.next = self.head
        self.head = new_node

    def insert_at_tail(self, value):
        new_node = Node(value)
        if self.head is None:
            self.head = new_node
            return
        current = self.head
        while current.next is not None:
            current = current.next
        current.next = new_node

    def insert_at_index(self, index, value):
        if index == 0:
            self.insert_at_head(value)
            return
        new_node = Node(value)
        current = self.head
        for _ in range(index - 1):
            current = current.next
        new_node.next = current.next
        current.next = new_node

    def delete_at_head(self):
        if self.head is None: return
        self.head = self.head.next

    def delete_at_tail(self):
        if self.head is None: return
        if self.head.next is None:
            self.head = None
            return
        prev = None
        current = self.head
        while current.next is not None:
            prev = current
            current = current.next
        prev.next = None

    def delete_at_index(self, index):
        if index == 0:
            self.delete_at_head()
            return
        prev = None
        current = self.head
        for i in range(index):
            prev = current
            current = current.next
        if prev and current:
            prev.next = current.next

    def search(self, value):
        current = self.head
        index = 0
        while current:
            if current.value == value: return index
            current = current.next
            index += 1
        return -1`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(1)'                  },  // class Node:
      { lineNumber: 2,  complexity: 'O(1)'                  },  // def __init__(self, value):
      { lineNumber: 3,  complexity: 'O(1)'                  },  // self.value = value
      { lineNumber: 4,  complexity: 'O(1)'                  },  // self.next = None
      { lineNumber: 6,  complexity: 'O(1)'                  },  // class LinkedList:
      { lineNumber: 7,  complexity: 'O(1)'                  },  // def __init__(self):
      { lineNumber: 8,  complexity: 'O(1)'                  },  // self.head = None
      { lineNumber: 10, complexity: 'O(1)'                  },  // def insert_at_head(self, value):
      { lineNumber: 11, complexity: 'O(1)'                  },  // new_node = Node(value)
      { lineNumber: 12, complexity: 'O(1)'                  },  // new_node.next = self.head
      { lineNumber: 13, complexity: 'O(1)'                  },  // self.head = new_node
      { lineNumber: 15, complexity: 'O(n)'                  },  // def insert_at_tail(self, value): — overall O(n)
      { lineNumber: 16, complexity: 'O(1)'                  },  // new_node = Node(value) — before loop
      { lineNumber: 17, complexity: 'O(1)'                  },  // if self.head is None — before loop
      { lineNumber: 18, complexity: 'O(1)'                  },  // self.head = new_node — before loop
      { lineNumber: 19, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 20, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 21, complexity: 'O(n)'                  },  // while current.next — top-level while
      { lineNumber: 22, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 23, complexity: 'O(1)'                  },  // current.next = new_node — after loop
      { lineNumber: 25, complexity: 'O(n)'                  },  // def insert_at_index(self, index, value): — overall O(n)
      { lineNumber: 26, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 27, complexity: 'O(1)'                  },  // self.insert_at_head — before loop
      { lineNumber: 28, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 29, complexity: 'O(1)'                  },  // new_node = Node(value) — before loop
      { lineNumber: 30, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 31, complexity: 'O(n)'                  },  // for _ in range(index-1) — top-level for
      { lineNumber: 32, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 33, complexity: 'O(1)'                  },  // new_node.next = current.next — after loop
      { lineNumber: 34, complexity: 'O(1)'                  },  // current.next = new_node — after loop
      { lineNumber: 36, complexity: 'O(1)'                  },  // def delete_at_head(self):
      { lineNumber: 37, complexity: 'O(1)'                  },  // if self.head is None: return
      { lineNumber: 38, complexity: 'O(1)'                  },  // self.head = self.head.next
      { lineNumber: 40, complexity: 'O(n)'                  },  // def delete_at_tail(self): — overall O(n)
      { lineNumber: 41, complexity: 'O(1)'                  },  // if self.head is None — before loop
      { lineNumber: 42, complexity: 'O(1)'                  },  // if self.head.next is None — before loop
      { lineNumber: 43, complexity: 'O(1)'                  },  // self.head = None — before loop
      { lineNumber: 44, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 45, complexity: 'O(1)'                  },  // prev = None — before loop
      { lineNumber: 46, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 47, complexity: 'O(n)'                  },  // while current.next — top-level while
      { lineNumber: 48, complexity: 'O(1)', context: 'O(n)' },  // prev = current — O(1) × n
      { lineNumber: 49, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 50, complexity: 'O(1)'                  },  // prev.next = None — after loop
      { lineNumber: 52, complexity: 'O(n)'                  },  // def delete_at_index(self, index): — overall O(n)
      { lineNumber: 53, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 54, complexity: 'O(1)'                  },  // self.delete_at_head() — before loop
      { lineNumber: 55, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 56, complexity: 'O(1)'                  },  // prev = None — before loop
      { lineNumber: 57, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 58, complexity: 'O(n)'                  },  // for i in range(index) — top-level for
      { lineNumber: 59, complexity: 'O(1)', context: 'O(n)' },  // prev = current — O(1) × n
      { lineNumber: 60, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 61, complexity: 'O(1)'                  },  // if prev and current — after loop
      { lineNumber: 62, complexity: 'O(1)'                  },  // prev.next = current.next — after loop
      { lineNumber: 64, complexity: 'O(n)'                  },  // def search(self, value): — overall O(n)
      { lineNumber: 65, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 66, complexity: 'O(1)'                  },  // index = 0 — before loop
      { lineNumber: 67, complexity: 'O(n)'                  },  // while current — top-level while
      { lineNumber: 68, complexity: 'O(1)', context: 'O(n)' },  // if current.value == value — O(1) × n
      { lineNumber: 69, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 70, complexity: 'O(1)', context: 'O(n)' },  // index += 1 — O(1) × n
      { lineNumber: 71, complexity: 'O(1)'                  },  // return -1 — after loop
    ],
  },
};

export const singlyVariant: LinkedListVariant = {
  TAGS,
  codeConfig,
  createAnimationSteps(dataList, action) {
    return createLinkedListSteps(
      dataList,
      action,
      TAGS as unknown as Record<string, string>,
      false,
      false,
    );
  },
};
