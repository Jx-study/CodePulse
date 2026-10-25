import type { CodeConfig } from "@/types";
import { TAGS } from "./tags";

export const codeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure insertAtHead(value):
  newNode ← new Node(value)
  If head = null Then
    head ← newNode
  Else
    newNode.next ← head
    head.prev ← newNode
    head ← newNode
  End If
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
  newNode.prev ← current
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
  If current.next ≠ null Then current.next.prev ← newNode
  current.next ← newNode
  newNode.prev ← current
  length ← length + 1
End Procedure

Procedure deleteAtHead():
  If head = null Then Return
  head ← head.next
  If head ≠ null Then head.prev ← null
  length ← length - 1
End Procedure

Procedure deleteAtTail():
  If head = null Then Return
  If head.next = null Then
    head ← null
    length ← length - 1
    Return
  End If
  current ← head
  While current.next ≠ null Do
    current ← current.next
  End While
  current.prev.next ← null
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
  current ← head
  For i ← 0 To index Do
    If i = index Then Break
    current ← current.next
  End For
  current.prev.next ← current.next
  If current.next ≠ null Then current.next.prev ← current.prev
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
      [TAGS.INSERT_HEAD_START]: [1, 3],
      [TAGS.INSERT_HEAD_CREATE]: [2],
      [TAGS.INSERT_HEAD_LINK]: [3, 6],
      [TAGS.INSERT_HEAD_LINK_PREV]: [7],
      [TAGS.INSERT_HEAD_UPDATE_ISNULL]: [4, 10],
      [TAGS.INSERT_HEAD_UPDATE_NOTNULL]: [8, 10],
      [TAGS.INSERT_HEAD_END]: [11],

      [TAGS.INSERT_TAIL_START]: [13],

      [TAGS.INSERT_TAIL_CHECK_HEAD]: [14],
      [TAGS.INSERT_TAIL_UPDATE_ISNULL_TRUE]: [14],
      [TAGS.INSERT_TAIL_CREATE_NEW_NODE_ISNULL]: [15],
      [TAGS.INSERT_TAIL_UPDATE_HEAD_ISNULL]: [16, 17],
      [TAGS.INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL]: [16, 17],
      [TAGS.INSERT_TAIL_CREATE]: [24],
      [TAGS.INSERT_TAIL_TRAVERSE]: [20, 21, 22, 23],
      [TAGS.INSERT_TAIL_LINK]: [25, 27],
      [TAGS.INSERT_TAIL_LINK_PREV]: [26, 27],
      [TAGS.INSERT_TAIL_END_ISNULL]: [18],
      [TAGS.INSERT_TAIL_END_NOTNULL]: [28],

      [TAGS.INSERT_INDEX_START]: [30, 31],
      [TAGS.INSERT_INDEX_ERROR]: [32],
      [TAGS.INSERT_INDEX_IFZERO]: [31, 34, 35, 36],
      [TAGS.INSERT_INDEX_TRAVERSE]: [38, 39, 40, 41],
      [TAGS.INSERT_INDEX_CREATE]: [42],
      [TAGS.INSERT_INDEX_LINK_NEW_NEXT]: [43],
      [TAGS.INSERT_INDEX_LINK_NEXT_PREV]: [44],
      [TAGS.INSERT_INDEX_LINK_CURRENT_NEXT]: [45, 47],
      [TAGS.INSERT_INDEX_LINK_NEW_PREV]: [46, 47],
      [TAGS.INSERT_INDEX_END]: [48],

      [TAGS.DELETE_HEAD_START]: [50, 51],
      [TAGS.DELETE_HEAD_CHECK]: [51],
      [TAGS.DELETE_HEAD_UPDATE_HEAD]: [52, 54],
      [TAGS.DELETE_HEAD_UPDATE_PREV]: [53, 54],
      [TAGS.DELETE_HEAD_FREE]: [55],
      [TAGS.DELETE_HEAD_END]: [55],

      [TAGS.DELETE_TAIL_START]: [57, 58],
      [TAGS.DELETE_TAIL_ISNEXTNULL]: [59],
      [TAGS.DELETE_TAIL_ISNEXTNULL_REMOVE]: [60, 61, 62],
      [TAGS.DELETE_TAIL_TRAVERSE]: [64, 65, 66, 67],
      [TAGS.DELETE_TAIL_UNLINK]: [68, 69],
      [TAGS.DELETE_TAIL_END]: [70],

      [TAGS.DELETE_INDEX_START]: [72, 73],
      [TAGS.DELETE_INDEX_ERROR]: [74],
      [TAGS.DELETE_INDEX_IFZERO]: [73, 76, 77, 78],
      [TAGS.DELETE_INDEX_TRAVERSE]: [80, 81, 82, 83, 84],
      [TAGS.DELETE_INDEX_UNLINK]: [85, 86, 87],
      [TAGS.DELETE_INDEX_END]: [88],

      [TAGS.SEARCH_START]: [90, 91, 92],
      [TAGS.SEARCH_COMPARE]: [93, 94, 95, 96],
      [TAGS.SEARCH_FOUND]: [94],
      [TAGS.SEARCH_NEXT]: [95, 96],
      [TAGS.SEARCH_NOT_FOUND]: [98],
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
      self.length = 0

    def insert_at_head(self, value):
      new_node = Node(value)
      if not self.head:
        self.head = new_node
      else:
        new_node.next = self.head
        self.head.prev = new_node
        self.head = new_node
      self.length += 1

    def insert_at_tail(self, value):
      new_node = Node(value)
      if not self.head:
        self.head = new_node
        self.length += 1
        return
      current = self.head
      while current.next:
        current = current.next
      current.next = new_node
      new_node.prev = current
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
      if current.next:
        current.next.prev = new_node
      new_node.prev = current
      current.next = new_node
      self.length += 1

    def delete_at_head(self):
      if not self.head: return
      self.head = self.head.next
      if self.head:
        self.head.prev = None
      self.length -= 1

    def delete_at_tail(self):
      if not self.head: return
      if not self.head.next:
        self.head = None
        self.length -= 1
        return
      current = self.head
      while current.next:
        current = current.next
      current.prev.next = None
      self.length -= 1

    def delete_at_index(self, index):
      if index < 0 or index >= self.length:
        raise IndexError("Index out of range")
      if index == 0:
        self.delete_at_head()
        return
      current = self.head
      for i in range(index):
        current = current.next
      current.prev.next = current.next
      if current.next:
        current.next.prev = current.prev
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
      { lineNumber: 5,  complexity: 'O(1)'                  },  // self.prev = None
      { lineNumber: 7,  complexity: 'O(1)'                  },  // class DoublyLinkedList:
      { lineNumber: 8,  complexity: 'O(1)'                  },  // def __init__(self):
      { lineNumber: 9,  complexity: 'O(1)'                  },  // self.head = None
      { lineNumber: 10, complexity: 'O(1)' },  // self.length = 0
      { lineNumber: 12, complexity: 'O(1)'                  },  // def insert_at_head(self, value):
      { lineNumber: 13, complexity: 'O(1)'                  },  // new_node = Node(value)
      { lineNumber: 14, complexity: 'O(1)'                  },  // if not self.head
      { lineNumber: 15, complexity: 'O(1)'                  },  // self.head = new_node
      { lineNumber: 16, complexity: 'O(1)'                  },  // else
      { lineNumber: 17, complexity: 'O(1)'                  },  // new_node.next = self.head
      { lineNumber: 18, complexity: 'O(1)'                  },  // self.head.prev = new_node
      { lineNumber: 19, complexity: 'O(1)'                  },  // self.head = new_node
      { lineNumber: 20, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 22, complexity: 'O(n)'                  },  // def insert_at_tail(self, value): — overall O(n)
      { lineNumber: 23, complexity: 'O(1)'                  },  // new_node = Node(value) — before loop
      { lineNumber: 24, complexity: 'O(1)'                  },  // if not self.head — before loop
      { lineNumber: 25, complexity: 'O(1)'                  },  // self.head = new_node — before loop
      { lineNumber: 26, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 27, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 28, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 29, complexity: 'O(n)'                  },  // while current.next — top-level while
      { lineNumber: 30, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 31, complexity: 'O(1)'                  },  // current.next = new_node — after loop
      { lineNumber: 32, complexity: 'O(1)'                  },  // new_node.prev = current — after loop
      { lineNumber: 33, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 35, complexity: 'O(n)'                  },  // def insert_at_index(self, index, value): — overall O(n)
      { lineNumber: 36, complexity: 'O(1)' },  // if index < 0 or index > self.length:
      { lineNumber: 37, complexity: 'O(1)' },  // raise IndexError("Index out of range")
      { lineNumber: 38, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 39, complexity: 'O(1)'                  },  // self.insert_at_head — before loop
      { lineNumber: 40, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 41, complexity: 'O(1)'                  },  // new_node = Node(value) — before loop
      { lineNumber: 42, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 43, complexity: 'O(n)'                  },  // for _ in range(index-1) — top-level for
      { lineNumber: 44, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 45, complexity: 'O(1)'                  },  // new_node.next = current.next — after loop
      { lineNumber: 46, complexity: 'O(1)'                  },  // if current.next — after loop
      { lineNumber: 47, complexity: 'O(1)'                  },  // current.next.prev = new_node — after loop
      { lineNumber: 48, complexity: 'O(1)'                  },  // new_node.prev = current — after loop
      { lineNumber: 49, complexity: 'O(1)'                  },  // current.next = new_node — after loop
      { lineNumber: 50, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 52, complexity: 'O(1)'                  },  // def delete_at_head(self):
      { lineNumber: 53, complexity: 'O(1)'                  },  // if not self.head: return
      { lineNumber: 54, complexity: 'O(1)'                  },  // self.head = self.head.next
      { lineNumber: 55, complexity: 'O(1)'                  },  // if self.head
      { lineNumber: 56, complexity: 'O(1)'                  },  // self.head.prev = None
      { lineNumber: 57, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 59, complexity: 'O(n)'                  },  // def delete_at_tail(self): — overall O(n)
      { lineNumber: 60, complexity: 'O(1)'                  },  // if not self.head — before loop
      { lineNumber: 61, complexity: 'O(1)'                  },  // if not self.head.next — before loop
      { lineNumber: 62, complexity: 'O(1)'                  },  // self.head = None — before loop
      { lineNumber: 63, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 64, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 65, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 66, complexity: 'O(n)'                  },  // while current.next — top-level while
      { lineNumber: 67, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 68, complexity: 'O(1)'                  },  // current.prev.next = None — after loop
      { lineNumber: 69, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 71, complexity: 'O(n)'                  },  // def delete_at_index(self, index): — overall O(n)
      { lineNumber: 72, complexity: 'O(1)' },  // if index < 0 or index >= self.length:
      { lineNumber: 73, complexity: 'O(1)' },  // raise IndexError("Index out of range")
      { lineNumber: 74, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 75, complexity: 'O(1)'                  },  // self.delete_at_head() — before loop
      { lineNumber: 76, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 77, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 78, complexity: 'O(n)'                  },  // for i in range(index) — top-level for
      { lineNumber: 79, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 80, complexity: 'O(1)'                  },  // current.prev.next = current.next — after loop
      { lineNumber: 81, complexity: 'O(1)'                  },  // if current.next — after loop
      { lineNumber: 82, complexity: 'O(1)'                  },  // current.next.prev = current.prev — after loop
      { lineNumber: 83, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 85, complexity: 'O(n)'                  },  // def search(self, value): — overall O(n)
      { lineNumber: 86, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 87, complexity: 'O(1)'                  },  // index = 0 — before loop
      { lineNumber: 88, complexity: 'O(n)'                  },  // while current — top-level while
      { lineNumber: 89, complexity: 'O(1)', context: 'O(n)' },  // if current.value == value — O(1) × n
      { lineNumber: 90, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 91, complexity: 'O(1)', context: 'O(n)' },  // index += 1 — O(1) × n
      { lineNumber: 92, complexity: 'O(1)'                  },  // return -1 — after loop
    ],
  },
};
