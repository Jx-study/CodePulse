import type { CodeConfig } from "@/types";
import { TAGS } from "./tags";

export const codeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure insertAtHead(value):
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
  If index < 0 Or index > length Then
    Return Error
  End If
  If index = 0 Then
    insertAtHead(value)
    Return
  End If
  If tail ≠ null And index = length Then
    insertAtTail(value)
    Return
  End If
  current ← head
  For i ← 0 To index - 2 Do
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
  If index < 0 Or index ≥ length Then
    Return Error
  End If
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
      [TAGS.INSERT_HEAD_START]: [1],
      [TAGS.INSERT_HEAD_CREATE]: [2],
      [TAGS.INSERT_HEAD_LINK]: [3],
      [TAGS.INSERT_HEAD_UPDATE]: [4],
      [TAGS.INSERT_HEAD_UPDATE_TAIL]: [5],
      [TAGS.INSERT_HEAD_END]: [5, 6],

      [TAGS.INSERT_TAIL_START]: [8],

      [TAGS.INSERT_TAIL_CHECK_HEAD]: [10],
      [TAGS.INSERT_TAIL_CREATE]: [9],
      [TAGS.INSERT_TAIL_UPDATE_ISNULL_TRUE]: [10],
      [TAGS.INSERT_TAIL_UPDATE_HEAD_ISNULL]: [11],
      [TAGS.INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL]: [12],
      [TAGS.INSERT_TAIL_LINK]: [15],
      [TAGS.INSERT_TAIL_POINTER_MOVE]: [16],
      [TAGS.INSERT_TAIL_END]: [17],

      [TAGS.INSERT_INDEX_START]: [19, 20],
      [TAGS.INSERT_INDEX_ERROR]: [21],
      [TAGS.INSERT_INDEX_IFZERO]: [20, 23, 24],
      [TAGS.INSERT_INDEX_IFTAIL]: [27, 28],
      [TAGS.INSERT_INDEX_TRAVERSE]: [31, 32, 33, 34],
      [TAGS.INSERT_INDEX_CREATE]: [35],
      [TAGS.INSERT_INDEX_LINK_NEW_NEXT]: [36],
      [TAGS.INSERT_INDEX_LINK_CURRENT_NEXT]: [37],
      [TAGS.INSERT_INDEX_UPDATE_TAIL]: [38],
      [TAGS.INSERT_INDEX_END]: [38, 39],

      [TAGS.DELETE_HEAD_START]: [41, 42],
      [TAGS.DELETE_HEAD_CHECK]: [42],
      [TAGS.DELETE_HEAD_UPDATE_HEAD]: [43],
      [TAGS.DELETE_HEAD_UPDATE_TAIL]: [44],
      [TAGS.DELETE_HEAD_FREE]: [45],
      [TAGS.DELETE_HEAD_END]: [45],

      [TAGS.DELETE_TAIL_START]: [47, 48],
      [TAGS.DELETE_TAIL_ISNEXTNULL]: [49],
      [TAGS.DELETE_TAIL_ISNEXTNULL_REMOVE]: [50, 51, 52],
      [TAGS.DELETE_TAIL_TRAVERSE]: [54, 55, 56, 57, 58, 59],
      [TAGS.DELETE_TAIL_UNLINK]: [60, 61],
      [TAGS.DELETE_TAIL_END]: [62],

      [TAGS.DELETE_INDEX_START]: [64, 65],
      [TAGS.DELETE_INDEX_ERROR]: [66],
      [TAGS.DELETE_INDEX_IFZERO]: [65, 68, 69, 70],
      [TAGS.DELETE_INDEX_IFTAIL]: [72, 73, 74],
      [TAGS.DELETE_INDEX_TRAVERSE]: [76, 77, 78, 79, 80, 81],
      [TAGS.DELETE_INDEX_UNLINK]: [83],
      [TAGS.DELETE_INDEX_END]: [84],

      [TAGS.SEARCH_START]: [86, 87, 88],
      [TAGS.SEARCH_COMPARE]: [89, 90, 91, 92],
      [TAGS.SEARCH_FOUND]: [90],
      [TAGS.SEARCH_NEXT]: [91, 92],
      [TAGS.SEARCH_NOT_FOUND]: [93, 94, 95],
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
        self.length = 0

    def insert_at_head(self, value):
        new_node = Node(value)
        new_node.next = self.head
        self.head = new_node
        if self.tail is None: self.tail = new_node
        self.length += 1

    def insert_at_tail(self, value):
        new_node = Node(value)
        if self.head is None:
            self.head = self.tail = new_node
            self.length += 1
            return
        self.tail.next = new_node
        self.tail = new_node
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
        if new_node.next is None: self.tail = new_node
        self.length += 1

    def delete_at_head(self):
        if self.head is None: return
        self.head = self.head.next
        if self.head is None: self.tail = None
        self.length -= 1

    def delete_at_tail(self):
        if self.head is None: return
        if self.head.next is None:
            self.head = self.tail = None
            self.length -= 1
            return
        prev = None
        current = self.head
        while current.next is not None:
            prev = current
            current = current.next
        prev.next = None
        self.tail = prev
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
        if prev.next is None: self.tail = prev
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
        { lineNumber: 9,  complexity: 'O(1)'                  },  // self.tail = None
        { lineNumber: 10, complexity: 'O(1)' },  // self.length = 0
        { lineNumber: 12, complexity: 'O(1)'                  },  // def insert_at_head(self, value):
        { lineNumber: 13, complexity: 'O(1)'                  },  // new_node = Node(value)
        { lineNumber: 14, complexity: 'O(1)'                  },  // new_node.next = self.head
        { lineNumber: 15, complexity: 'O(1)'                  },  // self.head = new_node
        { lineNumber: 16, complexity: 'O(1)'                  },  // if self.tail is None: self.tail = new_node
        { lineNumber: 17, complexity: 'O(1)' },  // self.length += 1
        { lineNumber: 19, complexity: 'O(1)'                  },  // def insert_at_tail(self, value):
        { lineNumber: 20, complexity: 'O(1)'                  },  // new_node = Node(value)
        { lineNumber: 21, complexity: 'O(1)'                  },  // if self.head is None:
        { lineNumber: 22, complexity: 'O(1)'                  },  // self.head = self.tail = new_node
        { lineNumber: 23, complexity: 'O(1)' },  // self.length += 1
        { lineNumber: 24, complexity: 'O(1)'                  },  // return
        { lineNumber: 25, complexity: 'O(1)'                  },  // self.tail.next = new_node
        { lineNumber: 26, complexity: 'O(1)'                  },  // self.tail = new_node
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
        { lineNumber: 41, complexity: 'O(1)'                  },  // if new_node.next is None: self.tail — after loop
        { lineNumber: 42, complexity: 'O(1)' },  // self.length += 1
        { lineNumber: 44, complexity: 'O(1)'                  },  // def delete_at_head(self):
        { lineNumber: 45, complexity: 'O(1)'                  },  // if self.head is None: return
        { lineNumber: 46, complexity: 'O(1)'                  },  // self.head = self.head.next
        { lineNumber: 47, complexity: 'O(1)'                  },  // if self.head is None: self.tail = None
        { lineNumber: 48, complexity: 'O(1)' },  // self.length -= 1
        { lineNumber: 50, complexity: 'O(n)'                  },  // def delete_at_tail(self): — overall O(n)
        { lineNumber: 51, complexity: 'O(1)'                  },  // if self.head is None — before loop
        { lineNumber: 52, complexity: 'O(1)'                  },  // if self.head.next is None — before loop
        { lineNumber: 53, complexity: 'O(1)'                  },  // self.head = self.tail = None — before loop
        { lineNumber: 54, complexity: 'O(1)' },  // self.length -= 1
        { lineNumber: 55, complexity: 'O(1)'                  },  // return — before loop
        { lineNumber: 56, complexity: 'O(1)'                  },  // prev = None — before loop
        { lineNumber: 57, complexity: 'O(1)'                  },  // current = self.head — before loop
        { lineNumber: 58, complexity: 'O(n)'                  },  // while current.next — top-level while
        { lineNumber: 59, complexity: 'O(1)', context: 'O(n)' },  // prev = current — O(1) × n
        { lineNumber: 60, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
        { lineNumber: 61, complexity: 'O(1)'                  },  // prev.next = None — after loop
        { lineNumber: 62, complexity: 'O(1)'                  },  // self.tail = prev — after loop
        { lineNumber: 63, complexity: 'O(1)' },  // self.length -= 1
        { lineNumber: 65, complexity: 'O(n)'                  },  // def delete_at_index(self, index): — overall O(n)
        { lineNumber: 66, complexity: 'O(1)' },  // if index < 0 or index >= self.length:
        { lineNumber: 67, complexity: 'O(1)' },  // raise IndexError("Index out of range")
        { lineNumber: 68, complexity: 'O(1)'                  },  // if index == 0 — before loop
        { lineNumber: 69, complexity: 'O(1)'                  },  // self.delete_at_head() — before loop
        { lineNumber: 70, complexity: 'O(1)'                  },  // return — before loop
        { lineNumber: 71, complexity: 'O(1)'                  },  // prev = None — before loop
        { lineNumber: 72, complexity: 'O(1)'                  },  // current = self.head — before loop
        { lineNumber: 73, complexity: 'O(n)'                  },  // for i in range(index) — top-level for
        { lineNumber: 74, complexity: 'O(1)', context: 'O(n)' },  // prev = current — O(1) × n
        { lineNumber: 75, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
        { lineNumber: 76, complexity: 'O(1)'                  },  // prev.next = current.next — after loop
        { lineNumber: 77, complexity: 'O(1)'                  },  // if prev.next is None: self.tail — after loop
        { lineNumber: 78, complexity: 'O(1)' },  // self.length -= 1
        { lineNumber: 80, complexity: 'O(n)'                  },  // def search(self, value): — overall O(n)
        { lineNumber: 81, complexity: 'O(1)'                  },  // current = self.head — before loop
        { lineNumber: 82, complexity: 'O(1)'                  },  // index = 0 — before loop
        { lineNumber: 83, complexity: 'O(n)'                  },  // while current — top-level while
        { lineNumber: 84, complexity: 'O(1)', context: 'O(n)' },  // if current.value == value — O(1) × n
        { lineNumber: 85, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
        { lineNumber: 86, complexity: 'O(1)', context: 'O(n)' },  // index += 1 — O(1) × n
        { lineNumber: 87, complexity: 'O(1)'                  },  // return -1 — after loop
      ],
    },
  };
