import type { CodeConfig } from "@/types";
import { TAGS } from "./tags";

export const codeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure insertAtHead(value):
  newNode ← new Node(value)
  If head = null Then
    head ← newNode
    tail ← newNode
  Else
    newNode.next ← head
    head.prev ← newNode
    head ← newNode
  End If
  length ← length + 1
End Procedure

Procedure insertAtTail(value):
  newNode ← new Node(value)
  If head = null Then
    head ← newNode
    tail ← newNode
    length ← length + 1
    Return
  End If
  tail.next ← newNode
  newNode.prev ← tail
  tail ← newNode
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
  If current.next ≠ null Then current.next.prev ← newNode
  current.next ← newNode
  newNode.prev ← current
  If newNode.next = null Then tail ← newNode
  length ← length + 1
End Procedure

Procedure deleteAtHead():
  If head = null Then Return
  head ← head.next
  If head ≠ null Then head.prev ← null
  Else tail ← null
  length ← length - 1
End Procedure

Procedure deleteAtTail():
  If head = null Then Return
  If head.next = null Then
    head ← null
    tail ← null
    length ← length - 1
    Return
  End If
  prev ← tail.prev
  prev.next ← null
  tail ← prev
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
  If tail ≠ null And index = length - 1 Then
    deleteAtTail()
    Return
  End If
  current ← head
  For i ← 0 To index - 1 Do
    current ← current.next
  End For
  current.prev.next ← current.next
  If current.next ≠ null Then current.next.prev ← current.prev
  Else tail ← current.prev
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
      [TAGS.INSERT_HEAD_LINK]: [3, 7],
      [TAGS.INSERT_HEAD_LINK_PREV]: [8],
      [TAGS.INSERT_HEAD_UPDATE_NOTNULL]: [9, 11],
      [TAGS.INSERT_HEAD_UPDATE_ISNULL]: [4],
      [TAGS.INSERT_HEAD_UPDATE_TAIL]: [5, 11],
      [TAGS.INSERT_HEAD_END]: [12],

      [TAGS.INSERT_TAIL_START]: [14],

      [TAGS.INSERT_TAIL_CHECK_HEAD]: [16],
      [TAGS.INSERT_TAIL_CREATE]: [15],
      [TAGS.INSERT_TAIL_UPDATE_ISNULL_TRUE]: [16],
      [TAGS.INSERT_TAIL_UPDATE_HEAD_ISNULL]: [17, 19],
      [TAGS.INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL]: [18, 19],
      [TAGS.INSERT_TAIL_LINK]: [22],
      [TAGS.INSERT_TAIL_LINK_PREV]: [23, 25],
      [TAGS.INSERT_TAIL_POINTER_MOVE]: [24, 25],
      [TAGS.INSERT_TAIL_END]: [26],

      [TAGS.INSERT_INDEX_START]: [28, 29],
      [TAGS.INSERT_INDEX_ERROR]: [30],
      [TAGS.INSERT_INDEX_IFZERO]: [29, 32, 33, 34],
      [TAGS.INSERT_INDEX_IFTAIL]: [36, 37, 38],
      [TAGS.INSERT_INDEX_TRAVERSE]: [40, 41, 42, 43],
      [TAGS.INSERT_INDEX_CREATE]: [44],
      [TAGS.INSERT_INDEX_LINK_NEW_NEXT]: [45],
      [TAGS.INSERT_INDEX_LINK_NEXT_PREV]: [46],
      [TAGS.INSERT_INDEX_LINK_CURRENT_NEXT]: [47],
      [TAGS.INSERT_INDEX_LINK_NEW_PREV]: [48, 50],
      [TAGS.INSERT_INDEX_UPDATE_TAIL]: [49, 50],
      [TAGS.INSERT_INDEX_END]: [49, 50, 51],

      [TAGS.DELETE_HEAD_START]: [53, 54],
      [TAGS.DELETE_HEAD_CHECK]: [54],
      [TAGS.DELETE_HEAD_UPDATE_HEAD]: [55],
      [TAGS.DELETE_HEAD_UPDATE_PREV]: [56, 58],
      [TAGS.DELETE_HEAD_UPDATE_TAIL]: [57, 58],
      [TAGS.DELETE_HEAD_FREE]: [59],
      [TAGS.DELETE_HEAD_END]: [59],

      [TAGS.DELETE_TAIL_START]: [61, 62],
      [TAGS.DELETE_TAIL_ISNEXTNULL]: [63],
      [TAGS.DELETE_TAIL_ISNEXTNULL_REMOVE]: [64, 65, 66],
      [TAGS.DELETE_TAIL_TRAVERSE]: [69],
      [TAGS.DELETE_TAIL_UNLINK]: [70, 72],
      [TAGS.DELETE_TAIL_END]: [71, 72],

      [TAGS.DELETE_INDEX_START]: [75, 76],
      [TAGS.DELETE_INDEX_ERROR]: [77],
      [TAGS.DELETE_INDEX_IFZERO]: [76, 79, 80, 81],
      [TAGS.DELETE_INDEX_IFTAIL]: [83, 84, 85],
      [TAGS.DELETE_INDEX_TRAVERSE]: [87, 88, 89],
      [TAGS.DELETE_INDEX_UNLINK]: [91, 92, 93, 94],
      [TAGS.DELETE_INDEX_END]: [95],

      [TAGS.SEARCH_START]: [97, 98, 99],
      [TAGS.SEARCH_COMPARE]: [100, 101, 102, 103],
      [TAGS.SEARCH_FOUND]: [101],
      [TAGS.SEARCH_NEXT]: [102, 103],
      [TAGS.SEARCH_NOT_FOUND]: [105],
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
        self.tail = None
        self.length = 0

    def insert_at_head(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = self.tail = new_node
        else:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node
        self.length += 1

    def insert_at_tail(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = self.tail = new_node
        else:
            self.tail.next = new_node
            new_node.prev = self.tail
            self.tail = new_node
        self.length += 1

    def insert_at_index(self, index, value):
        if index < 0 or index > self.length:
            raise IndexError("Index out of range")
        if index == 0:
            self.insert_at_head(value)
            return
        if self.tail and index == self.length:
            self.insert_at_tail(value)
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
        if new_node.next is None:
            self.tail = new_node
        self.length += 1

    def delete_at_head(self):
        if not self.head: return
        self.head = self.head.next
        if self.head:
            self.head.prev = None
        else:
            self.tail = None
        self.length -= 1

    def delete_at_tail(self):
        if not self.head: return
        if not self.head.next:
            self.head = self.tail = None
            self.length -= 1
            return
        self.tail = self.tail.prev
        self.tail.next = None
        self.length -= 1

    def delete_at_index(self, index):
        if index < 0 or index >= self.length:
            raise IndexError("Index out of range")
        if index == 0:
            self.delete_at_head()
            return
        if self.tail and index == self.length - 1:
            self.delete_at_tail()
            return
        current = self.head
        for i in range(index):
            current = current.next
        current.prev.next = current.next
        if current.next:
            current.next.prev = current.prev
        else:
            self.tail = current.prev
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
      { lineNumber: 10, complexity: 'O(1)'                  },  // self.tail = None
      { lineNumber: 11, complexity: 'O(1)' },  // self.length = 0
      { lineNumber: 13, complexity: 'O(1)'                  },  // def insert_at_head(self, value):
      { lineNumber: 14, complexity: 'O(1)'                  },  // new_node = Node(value)
      { lineNumber: 15, complexity: 'O(1)'                  },  // if not self.head
      { lineNumber: 16, complexity: 'O(1)'                  },  // self.head = self.tail = new_node
      { lineNumber: 17, complexity: 'O(1)'                  },  // else
      { lineNumber: 18, complexity: 'O(1)'                  },  // new_node.next = self.head
      { lineNumber: 19, complexity: 'O(1)'                  },  // self.head.prev = new_node
      { lineNumber: 20, complexity: 'O(1)'                  },  // self.head = new_node
      { lineNumber: 21, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 23, complexity: 'O(1)'                  },  // def insert_at_tail(self, value):
      { lineNumber: 24, complexity: 'O(1)'                  },  // new_node = Node(value)
      { lineNumber: 25, complexity: 'O(1)'                  },  // if not self.head
      { lineNumber: 26, complexity: 'O(1)'                  },  // self.head = self.tail = new_node
      { lineNumber: 27, complexity: 'O(1)'                  },  // else
      { lineNumber: 28, complexity: 'O(1)'                  },  // self.tail.next = new_node
      { lineNumber: 29, complexity: 'O(1)'                  },  // new_node.prev = self.tail
      { lineNumber: 30, complexity: 'O(1)'                  },  // self.tail = new_node
      { lineNumber: 31, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 33, complexity: 'O(n)'                  },  // def insert_at_index(self, index, value): — overall O(n)
      { lineNumber: 34, complexity: 'O(1)' },  // if index < 0 or index > self.length:
      { lineNumber: 35, complexity: 'O(1)' },  // raise IndexError("Index out of range")
      { lineNumber: 36, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 37, complexity: 'O(1)'                  },  // self.insert_at_head — before loop
      { lineNumber: 38, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 39, complexity: 'O(1)' },  // if self.tail and index == self.length:
      { lineNumber: 40, complexity: 'O(1)' },  // self.insert_at_tail(value)
      { lineNumber: 41, complexity: 'O(1)' },  // return
      { lineNumber: 42, complexity: 'O(1)'                  },  // new_node = Node(value) — before loop
      { lineNumber: 43, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 44, complexity: 'O(n)'                  },  // for _ in range(index-1) — top-level for
      { lineNumber: 45, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 46, complexity: 'O(1)'                  },  // new_node.next = current.next — after loop
      { lineNumber: 47, complexity: 'O(1)'                  },  // if current.next — after loop
      { lineNumber: 48, complexity: 'O(1)'                  },  // current.next.prev = new_node — after loop
      { lineNumber: 49, complexity: 'O(1)'                  },  // new_node.prev = current — after loop
      { lineNumber: 50, complexity: 'O(1)'                  },  // current.next = new_node — after loop
      { lineNumber: 51, complexity: 'O(1)'                  },  // if new_node.next is None — after loop
      { lineNumber: 52, complexity: 'O(1)'                  },  // self.tail = new_node — after loop
      { lineNumber: 53, complexity: 'O(1)' },  // self.length += 1
      { lineNumber: 55, complexity: 'O(1)'                  },  // def delete_at_head(self):
      { lineNumber: 56, complexity: 'O(1)'                  },  // if not self.head: return
      { lineNumber: 57, complexity: 'O(1)'                  },  // self.head = self.head.next
      { lineNumber: 58, complexity: 'O(1)'                  },  // if self.head
      { lineNumber: 59, complexity: 'O(1)'                  },  // self.head.prev = None
      { lineNumber: 60, complexity: 'O(1)'                  },  // else
      { lineNumber: 61, complexity: 'O(1)'                  },  // self.tail = None
      { lineNumber: 62, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 64, complexity: 'O(1)'                  },  // def delete_at_tail(self):
      { lineNumber: 65, complexity: 'O(1)'                  },  // if not self.head: return
      { lineNumber: 66, complexity: 'O(1)'                  },  // if not self.head.next
      { lineNumber: 67, complexity: 'O(1)'                  },  // self.head = self.tail = None
      { lineNumber: 68, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 69, complexity: 'O(1)'                  },  // return
      { lineNumber: 70, complexity: 'O(1)'                  },  // self.tail = self.tail.prev
      { lineNumber: 71, complexity: 'O(1)'                  },  // self.tail.next = None
      { lineNumber: 72, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 74, complexity: 'O(n)'                  },  // def delete_at_index(self, index): — overall O(n)
      { lineNumber: 75, complexity: 'O(1)' },  // if index < 0 or index >= self.length:
      { lineNumber: 76, complexity: 'O(1)' },  // raise IndexError("Index out of range")
      { lineNumber: 77, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 78, complexity: 'O(1)'                  },  // self.delete_at_head() — before loop
      { lineNumber: 79, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 80, complexity: 'O(1)' },  // if self.tail and index == self.length - 1:
      { lineNumber: 81, complexity: 'O(1)' },  // self.delete_at_tail()
      { lineNumber: 82, complexity: 'O(1)' },  // return
      { lineNumber: 83, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 84, complexity: 'O(n)'                  },  // for i in range(index) — top-level for
      { lineNumber: 85, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 86, complexity: 'O(1)'                  },  // current.prev.next = current.next — after loop
      { lineNumber: 87, complexity: 'O(1)'                  },  // if current.next — after loop
      { lineNumber: 88, complexity: 'O(1)'                  },  // current.next.prev = current.prev — after loop
      { lineNumber: 89, complexity: 'O(1)'                  },  // else — after loop
      { lineNumber: 90, complexity: 'O(1)'                  },  // self.tail = current.prev — after loop
      { lineNumber: 91, complexity: 'O(1)' },  // self.length -= 1
      { lineNumber: 93, complexity: 'O(n)'                  },  // def search(self, value): — overall O(n)
      { lineNumber: 94, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 95, complexity: 'O(1)'                  },  // index = 0 — before loop
      { lineNumber: 96, complexity: 'O(n)'                  },  // while current — top-level while
      { lineNumber: 97, complexity: 'O(1)', context: 'O(n)' },  // if current.value == value — O(1) × n
      { lineNumber: 98, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 99, complexity: 'O(1)', context: 'O(n)' },  // index += 1 — O(1) × n
      { lineNumber: 100, complexity: 'O(1)'                  },  // return -1 — after loop
    ],
  },
};
