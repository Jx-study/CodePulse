import type { CodeConfig } from "@/types";
import { TAGS } from "./tags";

export const codeConfig: CodeConfig = {
  pseudo: {
    content: `Class Node:
    Data:
      value ← null
      next ← null

    Class LinkedList:
      Data:
        head ← null
        tail ← null

      Procedure insertAtHead(value):
        newNode ← new Node(value)
        newNode.next ← head
        head ← newNode
        If tail = null Then tail ← newNode
      End Procedure

      Procedure insertAtTail(value):
        newNode ← new Node(value)
        If head = null Then
          head ← newNode
          tail ← newNode
          Return
        End If
        tail.next ← newNode
        tail ← newNode
      End Procedure

      Procedure insertAtIndex(index, value):
        If index = 0 Then
          insertAtHead(value)
          Return
        End If
        If tail ≠ null And index = length Then
          insertAtTail(value)
          Return
        End If
        current ← head
        For i ← 0 To index - 1 Do
          current ← current.next
        End For
        newNode ← new Node(value)
        newNode.next ← current.next
        current.next ← newNode
        If newNode.next = null Then tail ← newNode
      End Procedure

      Procedure deleteAtHead():
        If head = null Then Return
        head ← head.next
        If head = null Then tail ← null
      End Procedure

      Procedure deleteAtTail():
        If head = null Then Return
        If head.next = null Then
          head ← null
          tail ← null
          Return
        End If
        prev ← null
        current ← head
        While current.next ≠ null Do
          prev ← current
          current ← current.next
        End While
        prev.next ← null
        tail ← prev
      End Procedure

      Procedure deleteAtIndex(index):
        If index = 0 Then
          deleteAtHead()
          Return
        End If
        If tail ≠ null And index = length - 1 Then
          deleteAtTail()
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
      [TAGS.INSERT_HEAD_START]: [11],
      [TAGS.INSERT_HEAD_CREATE]: [12],
      [TAGS.INSERT_HEAD_LINK]: [13],
      [TAGS.INSERT_HEAD_UPDATE]: [14],
      [TAGS.INSERT_HEAD_UPDATE_TAIL]: [15],
      [TAGS.INSERT_HEAD_END]: [16],

      [TAGS.INSERT_TAIL_START]: [18],
      [TAGS.INSERT_TAIL_CREATE]: [19],
      [TAGS.INSERT_TAIL_UPDATE_ISNULL_TRUE]: [20],
      [TAGS.INSERT_TAIL_UPDATE_HEAD_ISNULL]: [21],
      [TAGS.INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL]: [22],
      [TAGS.INSERT_TAIL_LINK]: [25],
      [TAGS.INSERT_TAIL_POINTER_MOVE]: [26],
      [TAGS.INSERT_TAIL_END]: [27],

      [TAGS.INSERT_INDEX_START]: [29],
      [TAGS.INSERT_INDEX_IFZERO]: [30, 31],
      [TAGS.INSERT_INDEX_IFTAIL]: [34, 35],
      [TAGS.INSERT_INDEX_TRAVERSE]: [38, 39, 40, 41],
      [TAGS.INSERT_INDEX_CREATE]: [42],
      [TAGS.INSERT_INDEX_LINK_NEW_NEXT]: [43],
      [TAGS.INSERT_INDEX_LINK_CURRENT_NEXT]: [44],
      [TAGS.INSERT_INDEX_UPDATE_TAIL]: [45],
      [TAGS.INSERT_INDEX_END]: [46],

      [TAGS.DELETE_HEAD_START]: [48],
      [TAGS.DELETE_HEAD_CHECK]: [49],
      [TAGS.DELETE_HEAD_UPDATE_HEAD]: [50],
      [TAGS.DELETE_HEAD_UPDATE_TAIL]: [51],
      [TAGS.DELETE_HEAD_FREE]: [52],
      [TAGS.DELETE_HEAD_END]: [52],

      [TAGS.DELETE_TAIL_START]: [54],
      [TAGS.DELETE_TAIL_ISNEXTNULL]: [56],
      [TAGS.DELETE_TAIL_ISNEXTNULL_REMOVE]: [57, 58, 59],
      [TAGS.DELETE_TAIL_TRAVERSE]: [61, 62, 63, 64, 65, 66],
      [TAGS.DELETE_TAIL_UNLINK]: [67, 68],
      [TAGS.DELETE_TAIL_END]: [69],

      [TAGS.DELETE_INDEX_START]: [71],
      [TAGS.DELETE_INDEX_IFZERO]: [72, 73, 74],
      [TAGS.DELETE_INDEX_IFTAIL]: [76, 77, 78],
      [TAGS.DELETE_INDEX_TRAVERSE]: [82, 83, 84, 85],
      [TAGS.DELETE_INDEX_UNLINK]: [87],
      [TAGS.DELETE_INDEX_END]: [88],

      [TAGS.SEARCH_START]: [90, 91, 92],
      [TAGS.SEARCH_COMPARE]: [93, 94, 95, 96],
      [TAGS.SEARCH_FOUND]: [94],
      [TAGS.SEARCH_NEXT]: [95, 96],
      [TAGS.SEARCH_NOT_FOUND]: [97, 98, 99],
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
        self.tail = None

    def insert_at_head(self, value):
        new_node = Node(value)
        new_node.next = self.head
        self.head = new_node
        if self.tail is None: self.tail = new_node

    def insert_at_tail(self, value):
        new_node = Node(value)
        if self.head is None:
            self.head = self.tail = new_node
            return
        self.tail.next = new_node
        self.tail = new_node

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
        if new_node.next is None: self.tail = new_node

    def delete_at_head(self):
        if self.head is None: return
        self.head = self.head.next
        if self.head is None: self.tail = None

    def delete_at_tail(self):
        if self.head is None: return
        if self.head.next is None:
            self.head = self.tail = None
            return
        prev = None
        current = self.head
        while current.next is not None:
            prev = current
            current = current.next
        prev.next = None
        self.tail = prev

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
            if prev.next is None: self.tail = prev

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
        { lineNumber: 9,  complexity: 'O(1)'                  },  // self.tail = None
        { lineNumber: 11, complexity: 'O(1)'                  },  // def insert_at_head(self, value):
        { lineNumber: 12, complexity: 'O(1)'                  },  // new_node = Node(value)
        { lineNumber: 13, complexity: 'O(1)'                  },  // new_node.next = self.head
        { lineNumber: 14, complexity: 'O(1)'                  },  // self.head = new_node
        { lineNumber: 15, complexity: 'O(1)'                  },  // if self.tail is None: self.tail = new_node
        { lineNumber: 17, complexity: 'O(1)'                  },  // def insert_at_tail(self, value):
        { lineNumber: 18, complexity: 'O(1)'                  },  // new_node = Node(value)
        { lineNumber: 19, complexity: 'O(1)'                  },  // if self.head is None:
        { lineNumber: 20, complexity: 'O(1)'                  },  // self.head = self.tail = new_node
        { lineNumber: 21, complexity: 'O(1)'                  },  // return
        { lineNumber: 22, complexity: 'O(1)'                  },  // self.tail.next = new_node
        { lineNumber: 23, complexity: 'O(1)'                  },  // self.tail = new_node
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
        { lineNumber: 35, complexity: 'O(1)'                  },  // if new_node.next is None: self.tail — after loop
        { lineNumber: 37, complexity: 'O(1)'                  },  // def delete_at_head(self):
        { lineNumber: 38, complexity: 'O(1)'                  },  // if self.head is None: return
        { lineNumber: 39, complexity: 'O(1)'                  },  // self.head = self.head.next
        { lineNumber: 40, complexity: 'O(1)'                  },  // if self.head is None: self.tail = None
        { lineNumber: 42, complexity: 'O(n)'                  },  // def delete_at_tail(self): — overall O(n)
        { lineNumber: 43, complexity: 'O(1)'                  },  // if self.head is None — before loop
        { lineNumber: 44, complexity: 'O(1)'                  },  // if self.head.next is None — before loop
        { lineNumber: 45, complexity: 'O(1)'                  },  // self.head = self.tail = None — before loop
        { lineNumber: 46, complexity: 'O(1)'                  },  // return — before loop
        { lineNumber: 47, complexity: 'O(1)'                  },  // prev = None — before loop
        { lineNumber: 48, complexity: 'O(1)'                  },  // current = self.head — before loop
        { lineNumber: 49, complexity: 'O(n)'                  },  // while current.next — top-level while
        { lineNumber: 50, complexity: 'O(1)', context: 'O(n)' },  // prev = current — O(1) × n
        { lineNumber: 51, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
        { lineNumber: 52, complexity: 'O(1)'                  },  // prev.next = None — after loop
        { lineNumber: 53, complexity: 'O(1)'                  },  // self.tail = prev — after loop
        { lineNumber: 55, complexity: 'O(n)'                  },  // def delete_at_index(self, index): — overall O(n)
        { lineNumber: 56, complexity: 'O(1)'                  },  // if index == 0 — before loop
        { lineNumber: 57, complexity: 'O(1)'                  },  // self.delete_at_head() — before loop
        { lineNumber: 58, complexity: 'O(1)'                  },  // return — before loop
        { lineNumber: 59, complexity: 'O(1)'                  },  // prev = None — before loop
        { lineNumber: 60, complexity: 'O(1)'                  },  // current = self.head — before loop
        { lineNumber: 61, complexity: 'O(n)'                  },  // for i in range(index) — top-level for
        { lineNumber: 62, complexity: 'O(1)', context: 'O(n)' },  // prev = current — O(1) × n
        { lineNumber: 63, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
        { lineNumber: 64, complexity: 'O(1)'                  },  // if prev and current — after loop
        { lineNumber: 65, complexity: 'O(1)'                  },  // prev.next = current.next — after loop
        { lineNumber: 66, complexity: 'O(1)'                  },  // if prev.next is None: self.tail — after loop
        { lineNumber: 68, complexity: 'O(n)'                  },  // def search(self, value): — overall O(n)
        { lineNumber: 69, complexity: 'O(1)'                  },  // current = self.head — before loop
        { lineNumber: 70, complexity: 'O(1)'                  },  // index = 0 — before loop
        { lineNumber: 71, complexity: 'O(n)'                  },  // while current — top-level while
        { lineNumber: 72, complexity: 'O(1)', context: 'O(n)' },  // if current.value == value — O(1) × n
        { lineNumber: 73, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
        { lineNumber: 74, complexity: 'O(1)', context: 'O(n)' },  // index += 1 — O(1) × n
        { lineNumber: 75, complexity: 'O(1)'                  },  // return -1 — after loop
      ],
    },
  };
