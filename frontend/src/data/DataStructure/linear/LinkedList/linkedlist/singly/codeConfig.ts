import type { CodeConfig } from "@/types";
import { TAGS } from "./tags";

export const codeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure insertAtHead(value):
  newNode ← new Node(value)
  newNode.next ← head
  head ← newNode
  length ← length + 1
End Procedure

Procedure insertAtTail(value):
  If head = null Then
    newNode ← new Node(value)
    head ← newNode
    length ← length + 1
    Return
  End If
  current ← head
  While current.next ≠ null Do
    current ← current.next
  End While
  newNode ← new Node(value)
  current.next ← newNode
  length ← length + 1
End Procedure

Procedure insertAtIndex(index, value):
  If index < 0 Or index > length Then
    Return Error
  End If
  If index = 0 Then
    insertAtHead(value)
    Return
  End If
  current ← head
  For i ← 0 To index - 2 Do
    current ← current.next
  End For
  newNode ← new Node(value)
  newNode.next ← current.next
  current.next ← newNode
  length ← length + 1
End Procedure

Procedure deleteAtHead():
  If head = null Then Return
  head ← head.next
  length ← length - 1
End Procedure

Procedure deleteAtTail():
  If head = null Then Return
  If head.next = null Then
    head ← null
    length ← length - 1
    Return
  End If
  prev ← null
  current ← head
  While current.next ≠ null Do
    prev ← current
    current ← current.next
  End While
  prev.next ← null
  length ← length - 1
End Procedure

Procedure deleteAtIndex(index):
  If index < 0 Or index ≥ length Then
    Return Error
  End If
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
  length ← length - 1
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
      [TAGS.INSERT_HEAD_START]: [1],
      [TAGS.INSERT_HEAD_CREATE]: [2],
      [TAGS.INSERT_HEAD_LINK]: [3],
      [TAGS.INSERT_HEAD_UPDATE]: [4, 5],
      [TAGS.INSERT_HEAD_END]: [6],

      [TAGS.INSERT_TAIL_START]: [8],

      [TAGS.INSERT_TAIL_CHECK_HEAD]: [9],
      [TAGS.INSERT_TAIL_UPDATE_ISNULL_TRUE]: [9],
      [TAGS.INSERT_TAIL_CREATE_NEW_NODE_ISNULL]: [10],
      [TAGS.INSERT_TAIL_UPDATE_HEAD_ISNULL]: [11, 12],
      [TAGS.INSERT_TAIL_TRAVERSE]: [15, 16, 17, 18],
      [TAGS.INSERT_TAIL_CREATE]: [19],
      [TAGS.INSERT_TAIL_LINK]: [20, 21],
      [TAGS.INSERT_TAIL_END]: [22],

      [TAGS.INSERT_INDEX_START]: [24, 25],
      [TAGS.INSERT_INDEX_ERROR]: [26],
      [TAGS.INSERT_INDEX_IFZERO]: [24, 25, 28, 29],
      [TAGS.INSERT_INDEX_TRAVERSE]: [32, 33, 34, 35],
      [TAGS.INSERT_INDEX_CREATE]: [36],
      [TAGS.INSERT_INDEX_LINK_NEW_NEXT]: [37],
      [TAGS.INSERT_INDEX_LINK_CURRENT_NEXT]: [38, 39],
      [TAGS.INSERT_INDEX_END]: [40],

      [TAGS.DELETE_HEAD_START]: [42, 43],
      [TAGS.DELETE_HEAD_CHECK]: [43],
      [TAGS.DELETE_HEAD_UPDATE_HEAD]: [44, 45],
      [TAGS.DELETE_HEAD_FREE]: [46],
      [TAGS.DELETE_HEAD_END]: [46],

      [TAGS.DELETE_TAIL_START]: [48, 49],
      [TAGS.DELETE_TAIL_ISNEXTNULL]: [50],
      [TAGS.DELETE_TAIL_ISNEXTNULL_REMOVE]: [51, 52],
      [TAGS.DELETE_TAIL_TRAVERSE]: [55, 56, 57, 58, 59],
      [TAGS.DELETE_TAIL_UNLINK]: [61, 62],
      [TAGS.DELETE_TAIL_END]: [63],

      [TAGS.DELETE_INDEX_START]: [65, 66],
      [TAGS.DELETE_INDEX_ERROR]: [67],
      [TAGS.DELETE_INDEX_IFZERO]: [65, 66, 69, 70],
      [TAGS.DELETE_INDEX_TRAVERSE]: [73, 74, 75, 76, 77, 78, 79],
      [TAGS.DELETE_INDEX_UNLINK]: [80, 81],
      [TAGS.DELETE_INDEX_END]: [82],

      [TAGS.SEARCH_START]: [84, 85, 86],
      [TAGS.SEARCH_COMPARE]: [87, 88, 89, 90],
      [TAGS.SEARCH_FOUND]: [88],
      [TAGS.SEARCH_NEXT]: [89, 90],
      [TAGS.SEARCH_NOT_FOUND]: [91, 92],
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
        self.length = 0

    def insert_at_head(self, value):
        new_node = Node(value)
        new_node.next = self.head
        self.head = new_node
        self.length += 1

    def insert_at_tail(self, value):
        new_node = Node(value)
        if self.head is None:
            self.head = new_node
            self.length += 1
            return
        current = self.head
        while current.next is not None:
            current = current.next
        current.next = new_node
        self.length += 1

    def insert_at_index(self, index, value):
        if index < 0 or index > self.length:
            raise IndexError("Index out of range")
        if index == 0:
            self.insert_at_head(value)
            return
        new_node = Node(value)
        current = self.head
        for _ in range(index - 1):
            current = current.next
        new_node.next = current.next
        current.next = new_node
        self.length += 1

    def delete_at_head(self):
        if self.head is None: return
        self.head = self.head.next
        self.length -= 1

    def delete_at_tail(self):
        if self.head is None: return
        if self.head.next is None:
            self.head = None
            self.length -= 1
            return
        prev = None
        current = self.head
        while current.next is not None:
            prev = current
            current = current.next
        prev.next = None
        self.length -= 1

    def delete_at_index(self, index):
        if index < 0 or index >= self.length:
            raise IndexError("Index out of range")
        if index == 0:
            self.delete_at_head()
            return
        prev = None
        current = self.head
        for i in range(index):
            prev = current
            current = current.next
        prev.next = current.next
        self.length -= 1

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
      { lineNumber: 9, complexity: 'O(1)' },  // self.length = 0
      { lineNumber: 11, complexity: 'O(1)'                  },  // def insert_at_head(self, value):
      { lineNumber: 12, complexity: 'O(1)'                  },  // new_node = Node(value)
      { lineNumber: 13, complexity: 'O(1)'                  },  // new_node.next = self.head
      { lineNumber: 14, complexity: 'O(1)'                  },  // self.head = new_node
      { lineNumber: 15, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 17, complexity: 'O(n)'                  },  // def insert_at_tail(self, value): — overall O(n)
      { lineNumber: 18, complexity: 'O(1)'                  },  // new_node = Node(value) — before loop
      { lineNumber: 19, complexity: 'O(1)'                  },  // if self.head is None — before loop
      { lineNumber: 20, complexity: 'O(1)'                  },  // self.head = new_node — before loop
      { lineNumber: 21, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 22, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 23, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 24, complexity: 'O(n)'                  },  // while current.next — top-level while
      { lineNumber: 25, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 26, complexity: 'O(1)'                  },  // current.next = new_node — after loop
      { lineNumber: 27, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 29, complexity: 'O(n)'                  },  // def insert_at_index(self, index, value): — overall O(n)
      { lineNumber: 30, complexity: 'O(1)' },  // if index < 0 or index > self.length:
      { lineNumber: 31, complexity: 'O(1)' },  // raise IndexError("Index out of range")
      { lineNumber: 32, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 33, complexity: 'O(1)'                  },  // self.insert_at_head — before loop
      { lineNumber: 34, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 35, complexity: 'O(1)'                  },  // new_node = Node(value) — before loop
      { lineNumber: 36, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 37, complexity: 'O(n)'                  },  // for _ in range(index-1) — top-level for
      { lineNumber: 38, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 39, complexity: 'O(1)'                  },  // new_node.next = current.next — after loop
      { lineNumber: 40, complexity: 'O(1)'                  },  // current.next = new_node — after loop
      { lineNumber: 41, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 43, complexity: 'O(1)'                  },  // def delete_at_head(self):
      { lineNumber: 44, complexity: 'O(1)'                  },  // if self.head is None: return
      { lineNumber: 45, complexity: 'O(1)'                  },  // self.head = self.head.next
      { lineNumber: 46, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 48, complexity: 'O(n)'                  },  // def delete_at_tail(self): — overall O(n)
      { lineNumber: 49, complexity: 'O(1)'                  },  // if self.head is None — before loop
      { lineNumber: 50, complexity: 'O(1)'                  },  // if self.head.next is None — before loop
      { lineNumber: 51, complexity: 'O(1)'                  },  // self.head = None — before loop
      { lineNumber: 52, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 53, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 54, complexity: 'O(1)'                  },  // prev = None — before loop
      { lineNumber: 55, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 56, complexity: 'O(n)'                  },  // while current.next — top-level while
      { lineNumber: 57, complexity: 'O(1)', context: 'O(n)' },  // prev = current — O(1) × n
      { lineNumber: 58, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 59, complexity: 'O(1)'                  },  // prev.next = None — after loop
      { lineNumber: 60, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 62, complexity: 'O(n)'                  },  // def delete_at_index(self, index): — overall O(n)
      { lineNumber: 63, complexity: 'O(1)' },  // if index < 0 or index >= self.length:
      { lineNumber: 64, complexity: 'O(1)' },  // raise IndexError("Index out of range")
      { lineNumber: 65, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 66, complexity: 'O(1)'                  },  // self.delete_at_head() — before loop
      { lineNumber: 67, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 68, complexity: 'O(1)'                  },  // prev = None — before loop
      { lineNumber: 69, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 70, complexity: 'O(n)'                  },  // for i in range(index) — top-level for
      { lineNumber: 71, complexity: 'O(1)', context: 'O(n)' },  // prev = current — O(1) × n
      { lineNumber: 72, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 73, complexity: 'O(1)'                  },  // prev.next = current.next — after loop
      { lineNumber: 74, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 76, complexity: 'O(n)'                  },  // def search(self, value): — overall O(n)
      { lineNumber: 77, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 78, complexity: 'O(1)'                  },  // index = 0 — before loop
      { lineNumber: 79, complexity: 'O(n)'                  },  // while current — top-level while
      { lineNumber: 80, complexity: 'O(1)', context: 'O(n)' },  // if current.value == value — O(1) × n
      { lineNumber: 81, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 82, complexity: 'O(1)', context: 'O(n)' },  // index += 1 — O(1) × n
      { lineNumber: 83, complexity: 'O(1)'                  },  // return -1 — after loop
    ],
  },
};
