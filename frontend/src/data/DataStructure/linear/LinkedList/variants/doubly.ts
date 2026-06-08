import type { CodeConfig } from "@/types";
import type { LinkedListVariant } from "./types";
import { createLinkedListSteps } from "./createLinkedListSteps";

const TAGS = {
  INSERT_HEAD_START: "DBL_INSERT_HEAD_START",
  INSERT_HEAD_CREATE: "DBL_INSERT_HEAD_CREATE",
  INSERT_HEAD_LINK: "DBL_INSERT_HEAD_LINK",
  INSERT_HEAD_LINK_PREV: "DBL_INSERT_HEAD_LINK_PREV",
  INSERT_HEAD_UPDATE: "DBL_INSERT_HEAD_UPDATE",
  INSERT_HEAD_UPDATE_ISNULL: "DBL_INSERT_HEAD_UPDATE_ISNULL",
  INSERT_HEAD_UPDATE_NOTNULL: "DBL_INSERT_HEAD_UPDATE_NOTNULL",
  INSERT_HEAD_UPDATE_TAIL: "DBL_INSERT_HEAD_UPDATE_TAIL",
  INSERT_HEAD_END: "DBL_INSERT_HEAD_END",
  INSERT_TAIL_START: "DBL_INSERT_TAIL_START",
  INSERT_TAIL_TRAVERSE: "DBL_INSERT_TAIL_TRAVERSE",
  INSERT_TAIL_CREATE: "DBL_INSERT_TAIL_CREATE",
  INSERT_TAIL_UPDATE_ISNULL_TRUE: "DBL_INSERT_TAIL_UPDATE_ISNULL_TRUE",
  INSERT_TAIL_CREATE_NEW_NODE_ISNULL: "DBL_INSERT_TAIL_CREATE_NEW_NODE_ISNULL",
  INSERT_TAIL_UPDATE_HEAD_ISNULL: "DBL_INSERT_TAIL_UPDATE_HEAD_ISNULL",
  INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL: "DBL_INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL",
  INSERT_TAIL_LINK: "DBL_INSERT_TAIL_LINK",
  INSERT_TAIL_LINK_PREV: "DBL_INSERT_TAIL_LINK_PREV",
  INSERT_TAIL_POINTER_MOVE: "DBL_INSERT_TAIL_POINTER_MOVE",
  INSERT_TAIL_END: "DBL_INSERT_TAIL_END",
  INSERT_TAIL_END_ISNULL: "DBL_INSERT_TAIL_END_ISNULL",
  INSERT_TAIL_END_NOTNULL: "DBL_INSERT_TAIL_END_NOTNULL",
  INSERT_INDEX_START: "DBL_INSERT_INDEX_START",
  INSERT_INDEX_IFZERO: "DBL_INSERT_INDEX_IFZERO",
  INSERT_INDEX_IFTAIL: "DBL_INSERT_INDEX_IFTAIL",
  INSERT_INDEX_TRAVERSE: "DBL_INSERT_INDEX_TRAVERSE",
  INSERT_INDEX_CREATE: "DBL_INSERT_INDEX_CREATE",
  INSERT_INDEX_LINK: "DBL_INSERT_INDEX_LINK",
  INSERT_INDEX_LINK_PREV: "DBL_INSERT_INDEX_LINK_PREV",
  INSERT_INDEX_LINK_NEW_NEXT: "DBL_INSERT_INDEX_LINK_NEW_NEXT",
  INSERT_INDEX_LINK_NEXT_PREV: "DBL_INSERT_INDEX_LINK_NEXT_PREV",
  INSERT_INDEX_LINK_CURRENT_NEXT: "DBL_INSERT_INDEX_LINK_CURRENT_NEXT",
  INSERT_INDEX_LINK_NEW_PREV: "DBL_INSERT_INDEX_LINK_NEW_PREV",
  INSERT_INDEX_UPDATE_TAIL: "DBL_INSERT_INDEX_UPDATE_TAIL",
  INSERT_INDEX_END: "DBL_INSERT_INDEX_END",
  DELETE_HEAD_START: "DBL_DELETE_HEAD_START",
  DELETE_HEAD_CHECK: "DBL_DELETE_HEAD_CHECK",
  DELETE_HEAD_UPDATE_HEAD: "DBL_DELETE_HEAD_UPDATE_HEAD",
  DELETE_HEAD_UPDATE_PREV: "DBL_DELETE_HEAD_UPDATE_PREV",
  DELETE_HEAD_UPDATE_TAIL: "DBL_DELETE_HEAD_UPDATE_TAIL",
  DELETE_HEAD_FREE: "DBL_DELETE_HEAD_FREE",
  DELETE_HEAD_END: "DBL_DELETE_HEAD_END",
  DELETE_TAIL_START: "DBL_DELETE_TAIL_START",
  DELETE_TAIL_ISNEXTNULL: "DBL_DELETE_TAIL_ISNEXTNULL",
  DELETE_TAIL_ISNEXTNULL_REMOVE: "DBL_DELETE_TAIL_ISNEXTNULL_REMOVE",
  DELETE_TAIL_TRAVERSE: "DBL_DELETE_TAIL_TRAVERSE",
  DELETE_TAIL_UNLINK: "DBL_DELETE_TAIL_UNLINK",
  DELETE_TAIL_SINGLE: "DBL_DELETE_TAIL_SINGLE",
  DELETE_TAIL_END: "DBL_DELETE_TAIL_END",
  DELETE_INDEX_START: "DBL_DELETE_INDEX_START",
  DELETE_INDEX_IFZERO: "DBL_DELETE_INDEX_IFZERO",
  DELETE_INDEX_IFTAIL: "DBL_DELETE_INDEX_IFTAIL",
  DELETE_INDEX_TRAVERSE: "DBL_DELETE_INDEX_TRAVERSE",
  DELETE_INDEX_UNLINK: "DBL_DELETE_INDEX_UNLINK",
  DELETE_INDEX_END: "DBL_DELETE_INDEX_END",
  SEARCH_START: "DBL_SEARCH_START",
  SEARCH_COMPARE: "DBL_SEARCH_COMPARE",
  SEARCH_FOUND: "DBL_SEARCH_FOUND",
  SEARCH_NEXT: "DBL_SEARCH_NEXT",
  SEARCH_NOT_FOUND: "DBL_SEARCH_NOT_FOUND",
} as const;

const codeConfig: CodeConfig = {
  pseudo: {
    content: `Class Node:
    Data:
      value ← null
      next ← null
      prev ← null

    Class DoublyLinkedList:
      Data:
        head ← null

      Procedure insertAtHead(value):
        newNode ← new Node(value)
        If head = null Then
          head ← newNode
        Else
          newNode.next ← head
          head.prev ← newNode
          head ← newNode
        End If
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
        newNode.prev ← current
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
        If current.next ≠ null Then current.next.prev ← newNode
        current.next ← newNode
        newNode.prev ← current
      End Procedure

      Procedure deleteAtHead():
        If head = null Then Return
        head ← head.next
        If head ≠ null Then head.prev ← null
      End Procedure

      Procedure deleteAtTail():
        If head = null Then Return
        If head.next = null Then
          head ← null
          Return
        End If
        current ← head
        While current.next ≠ null Do
          current ← current.next
        End While
        current.prev.next ← null
      End Procedure

      Procedure deleteAtIndex(index):
        If index = 0 Then
          deleteAtHead()
          Return
        End If
        current ← head
        For i ← 0 To index Do
          If i = index Then Break
          current ← current.next
        End For
        current.prev.next ← current.next
        If current.next ≠ null Then current.next.prev ← current.prev
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
      [TAGS.INSERT_HEAD_START]: [11, 13],
      [TAGS.INSERT_HEAD_CREATE]: [12],
      [TAGS.INSERT_HEAD_LINK]: [16],
      [TAGS.INSERT_HEAD_LINK_PREV]: [17],
      [TAGS.INSERT_HEAD_UPDATE_ISNULL]: [14],
      [TAGS.INSERT_HEAD_UPDATE_NOTNULL]: [18],
      [TAGS.INSERT_HEAD_END]: [20],

      [TAGS.INSERT_TAIL_START]: [22],
      [TAGS.INSERT_TAIL_UPDATE_ISNULL_TRUE]: [23],
      [TAGS.INSERT_TAIL_CREATE_NEW_NODE_ISNULL]: [24],
      [TAGS.INSERT_TAIL_UPDATE_HEAD_ISNULL]: [25],
      [TAGS.INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL]: [25],
      [TAGS.INSERT_TAIL_CREATE]: [32],
      [TAGS.INSERT_TAIL_TRAVERSE]: [28, 29, 30, 31],
      [TAGS.INSERT_TAIL_LINK]: [33],
      [TAGS.INSERT_TAIL_LINK_PREV]: [34],
      [TAGS.INSERT_TAIL_END_ISNULL]: [26],
      [TAGS.INSERT_TAIL_END_NOTNULL]: [35],

      [TAGS.INSERT_INDEX_START]: [37],
      [TAGS.INSERT_INDEX_IFZERO]: [38, 39, 40],
      [TAGS.INSERT_INDEX_TRAVERSE]: [42, 43, 44, 45],
      [TAGS.INSERT_INDEX_CREATE]: [46],
      [TAGS.INSERT_INDEX_LINK_NEW_NEXT]: [47],
      [TAGS.INSERT_INDEX_LINK_NEXT_PREV]: [48],
      [TAGS.INSERT_INDEX_LINK_CURRENT_NEXT]: [49],
      [TAGS.INSERT_INDEX_LINK_NEW_PREV]: [50],
      [TAGS.INSERT_INDEX_END]: [51],

      [TAGS.DELETE_HEAD_START]: [53],
      [TAGS.DELETE_HEAD_CHECK]: [54],
      [TAGS.DELETE_HEAD_UPDATE_HEAD]: [55],
      [TAGS.DELETE_HEAD_UPDATE_PREV]: [56],
      [TAGS.DELETE_HEAD_FREE]: [57],
      [TAGS.DELETE_HEAD_END]: [57],

      [TAGS.DELETE_TAIL_START]: [59],
      [TAGS.DELETE_TAIL_ISNEXTNULL]: [61],
      [TAGS.DELETE_TAIL_ISNEXTNULL_REMOVE]: [62, 63],
      [TAGS.DELETE_TAIL_TRAVERSE]: [65, 66, 67, 68],
      [TAGS.DELETE_TAIL_UNLINK]: [69],
      [TAGS.DELETE_TAIL_END]: [70],

      [TAGS.DELETE_INDEX_START]: [72],
      [TAGS.DELETE_INDEX_IFZERO]: [73, 74, 75],
      [TAGS.DELETE_INDEX_TRAVERSE]: [77, 78, 79, 80, 81],
      [TAGS.DELETE_INDEX_UNLINK]: [82, 83],
      [TAGS.DELETE_INDEX_END]: [84],

      [TAGS.SEARCH_START]: [86],
      [TAGS.SEARCH_COMPARE]: [89, 90, 91, 92],
      [TAGS.SEARCH_FOUND]: [90],
      [TAGS.SEARCH_NEXT]: [91, 92],
      [TAGS.SEARCH_NOT_FOUND]: [94],
    },
  },
  python: {
    content: `class Node:
    def __init__(self, value):
      self.value = value
      self.next = None
      self.prev = None

class DoublyLinkedList:
    def __init__(self):
      self.head = None

    def insert_at_head(self, value):
      new_node = Node(value)
      if not self.head:
        self.head = new_node
      else:
        new_node.next = self.head
        self.head.prev = new_node
        self.head = new_node

    def insert_at_tail(self, value):
      new_node = Node(value)
      if not self.head:
        self.head = new_node
        return
      current = self.head
      while current.next:
        current = current.next
      current.next = new_node
      new_node.prev = current

    def insert_at_index(self, index, value):
      if index == 0:
        self.insert_at_head(value)
        return
      new_node = Node(value)
      current = self.head
      for _ in range(index - 1):
        current = current.next
      new_node.next = current.next
      if current.next:
        current.next.prev = new_node
      new_node.prev = current
      current.next = new_node

    def delete_at_head(self):
      if not self.head: return
      self.head = self.head.next
      if self.head:
        self.head.prev = None

    def delete_at_tail(self):
      if not self.head: return
      if not self.head.next:
        self.head = None
        return
      current = self.head
      while current.next:
        current = current.next
      current.prev.next = None

    def delete_at_index(self, index):
      if index == 0:
        self.delete_at_head()
        return
      current = self.head
      for i in range(index):
        current = current.next
      current.prev.next = current.next
      if current.next:
        current.next.prev = current.prev

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
      { lineNumber: 5,  complexity: 'O(1)'                  },  // self.prev = None
      { lineNumber: 7,  complexity: 'O(1)'                  },  // class DoublyLinkedList:
      { lineNumber: 8,  complexity: 'O(1)'                  },  // def __init__(self):
      { lineNumber: 9,  complexity: 'O(1)'                  },  // self.head = None
      { lineNumber: 11, complexity: 'O(1)'                  },  // def insert_at_head(self, value):
      { lineNumber: 12, complexity: 'O(1)'                  },  // new_node = Node(value)
      { lineNumber: 13, complexity: 'O(1)'                  },  // if not self.head
      { lineNumber: 14, complexity: 'O(1)'                  },  // self.head = new_node
      { lineNumber: 15, complexity: 'O(1)'                  },  // else
      { lineNumber: 16, complexity: 'O(1)'                  },  // new_node.next = self.head
      { lineNumber: 17, complexity: 'O(1)'                  },  // self.head.prev = new_node
      { lineNumber: 18, complexity: 'O(1)'                  },  // self.head = new_node
      { lineNumber: 20, complexity: 'O(n)'                  },  // def insert_at_tail(self, value): — overall O(n)
      { lineNumber: 21, complexity: 'O(1)'                  },  // new_node = Node(value) — before loop
      { lineNumber: 22, complexity: 'O(1)'                  },  // if not self.head — before loop
      { lineNumber: 23, complexity: 'O(1)'                  },  // self.head = new_node — before loop
      { lineNumber: 24, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 25, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 26, complexity: 'O(n)'                  },  // while current.next — top-level while
      { lineNumber: 27, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 28, complexity: 'O(1)'                  },  // current.next = new_node — after loop
      { lineNumber: 29, complexity: 'O(1)'                  },  // new_node.prev = current — after loop
      { lineNumber: 31, complexity: 'O(n)'                  },  // def insert_at_index(self, index, value): — overall O(n)
      { lineNumber: 32, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 33, complexity: 'O(1)'                  },  // self.insert_at_head — before loop
      { lineNumber: 34, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 35, complexity: 'O(1)'                  },  // new_node = Node(value) — before loop
      { lineNumber: 36, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 37, complexity: 'O(n)'                  },  // for _ in range(index-1) — top-level for
      { lineNumber: 38, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 39, complexity: 'O(1)'                  },  // new_node.next = current.next — after loop
      { lineNumber: 40, complexity: 'O(1)'                  },  // if current.next — after loop
      { lineNumber: 41, complexity: 'O(1)'                  },  // current.next.prev = new_node — after loop
      { lineNumber: 42, complexity: 'O(1)'                  },  // new_node.prev = current — after loop
      { lineNumber: 43, complexity: 'O(1)'                  },  // current.next = new_node — after loop
      { lineNumber: 45, complexity: 'O(1)'                  },  // def delete_at_head(self):
      { lineNumber: 46, complexity: 'O(1)'                  },  // if not self.head: return
      { lineNumber: 47, complexity: 'O(1)'                  },  // self.head = self.head.next
      { lineNumber: 48, complexity: 'O(1)'                  },  // if self.head
      { lineNumber: 49, complexity: 'O(1)'                  },  // self.head.prev = None
      { lineNumber: 51, complexity: 'O(n)'                  },  // def delete_at_tail(self): — overall O(n)
      { lineNumber: 52, complexity: 'O(1)'                  },  // if not self.head — before loop
      { lineNumber: 53, complexity: 'O(1)'                  },  // if not self.head.next — before loop
      { lineNumber: 54, complexity: 'O(1)'                  },  // self.head = None — before loop
      { lineNumber: 55, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 56, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 57, complexity: 'O(n)'                  },  // while current.next — top-level while
      { lineNumber: 58, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 59, complexity: 'O(1)'                  },  // current.prev.next = None — after loop
      { lineNumber: 61, complexity: 'O(n)'                  },  // def delete_at_index(self, index): — overall O(n)
      { lineNumber: 62, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 63, complexity: 'O(1)'                  },  // self.delete_at_head() — before loop
      { lineNumber: 64, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 65, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 66, complexity: 'O(n)'                  },  // for i in range(index) — top-level for
      { lineNumber: 67, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 68, complexity: 'O(1)'                  },  // current.prev.next = current.next — after loop
      { lineNumber: 69, complexity: 'O(1)'                  },  // if current.next — after loop
      { lineNumber: 70, complexity: 'O(1)'                  },  // current.next.prev = current.prev — after loop
      { lineNumber: 72, complexity: 'O(n)'                  },  // def search(self, value): — overall O(n)
      { lineNumber: 73, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 74, complexity: 'O(1)'                  },  // index = 0 — before loop
      { lineNumber: 75, complexity: 'O(n)'                  },  // while current — top-level while
      { lineNumber: 76, complexity: 'O(1)', context: 'O(n)' },  // if current.value == value — O(1) × n
      { lineNumber: 77, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 78, complexity: 'O(1)', context: 'O(n)' },  // index += 1 — O(1) × n
      { lineNumber: 79, complexity: 'O(1)'                  },  // return -1 — after loop
    ],
  },
};

export const doublyVariant: LinkedListVariant = {
  TAGS,
  codeConfig,
  createAnimationSteps(dataList, action) {
    return createLinkedListSteps(
      dataList,
      action,
      TAGS as unknown as Record<string, string>,
      true,
      false,
    );
  },
};
