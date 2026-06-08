import type { CodeConfig } from "@/types";
import { TAGS } from "./tags";

export const codeConfig: CodeConfig = {
  pseudo: {
    content: `Class Node:
    Data:
      value ← null
      next ← null
      prev ← null

    Class DoublyLinkedList:
      Data:
        head ← null
        tail ← null

      Procedure insertAtHead(value):
        newNode ← new Node(value)
        If head = null Then
          head ← newNode
          tail ← newNode
        Else
          newNode.next ← head
          head.prev ← newNode
          head ← newNode
        End If
      End Procedure

      Procedure insertAtTail(value):
        newNode ← new Node(value)
        If head = null Then
          head ← newNode
          tail ← newNode
          Return
        End If
        tail.next ← newNode
        newNode.prev ← tail
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
        If current.next ≠ null Then current.next.prev ← newNode
        current.next ← newNode
        newNode.prev ← current
        If newNode.next = null Then tail ← newNode
      End Procedure

      Procedure deleteAtHead():
        If head = null Then Return
        head ← head.next
        If head ≠ null Then head.prev ← null
        Else tail ← null
      End Procedure

      Procedure deleteAtTail():
        If head = null Then Return
        If head.next = null Then
          head ← null
          tail ← null
          Return
        End If
        prev ← tail.prev
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
        current ← head
        For i ← 0 To index Do
          current ← current.next
        End For
        current.prev.next ← current.next
        If current.next ≠ null Then current.next.prev ← current.prev
        Else tail ← current.prev
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
      [TAGS.INSERT_HEAD_START]: [11, 12],
      [TAGS.INSERT_HEAD_CREATE]: [13],
      [TAGS.INSERT_HEAD_LINK]: [18],
      [TAGS.INSERT_HEAD_LINK_PREV]: [19],
      [TAGS.INSERT_HEAD_UPDATE_NOTNULL]: [20],
      [TAGS.INSERT_HEAD_UPDATE_ISNULL]: [15],
      [TAGS.INSERT_HEAD_UPDATE_TAIL]: [16],
      [TAGS.INSERT_HEAD_END]: [22],

      [TAGS.INSERT_TAIL_START]: [24],
      [TAGS.INSERT_TAIL_CREATE]: [25],
      [TAGS.INSERT_TAIL_UPDATE_ISNULL_TRUE]: [26],
      [TAGS.INSERT_TAIL_UPDATE_HEAD_ISNULL]: [27],
      [TAGS.INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL]: [28],
      [TAGS.INSERT_TAIL_LINK]: [31],
      [TAGS.INSERT_TAIL_LINK_PREV]: [32],
      [TAGS.INSERT_TAIL_POINTER_MOVE]: [33],
      [TAGS.INSERT_TAIL_END]: [34],

      [TAGS.INSERT_INDEX_START]: [35],
      [TAGS.INSERT_INDEX_IFZERO]: [37, 38, 39],
      [TAGS.INSERT_INDEX_IFTAIL]: [41, 42, 43],
      [TAGS.INSERT_INDEX_TRAVERSE]: [45, 46, 47, 48],
      [TAGS.INSERT_INDEX_CREATE]: [49],
      [TAGS.INSERT_INDEX_LINK_NEW_NEXT]: [50],
      [TAGS.INSERT_INDEX_LINK_NEXT_PREV]: [51],
      [TAGS.INSERT_INDEX_LINK_CURRENT_NEXT]: [52],
      [TAGS.INSERT_INDEX_LINK_NEW_PREV]: [53],
      [TAGS.INSERT_INDEX_UPDATE_TAIL]: [54],
      [TAGS.INSERT_INDEX_END]: [55],

      [TAGS.DELETE_HEAD_START]: [57],
      [TAGS.DELETE_HEAD_CHECK]: [58],
      [TAGS.DELETE_HEAD_UPDATE_HEAD]: [59],
      [TAGS.DELETE_HEAD_UPDATE_PREV]: [60],
      [TAGS.DELETE_HEAD_UPDATE_TAIL]: [61],
      [TAGS.DELETE_HEAD_FREE]: [62],
      [TAGS.DELETE_HEAD_END]: [62],

      [TAGS.DELETE_TAIL_START]: [64],
      [TAGS.DELETE_TAIL_ISNEXTNULL]: [66],
      [TAGS.DELETE_TAIL_ISNEXTNULL_REMOVE]: [67, 68],
      [TAGS.DELETE_TAIL_TRAVERSE]: [71],
      [TAGS.DELETE_TAIL_UNLINK]: [72],
      [TAGS.DELETE_TAIL_END]: [73],

      [TAGS.DELETE_INDEX_START]: [75],
      [TAGS.DELETE_INDEX_IFZERO]: [77, 78, 79],
      [TAGS.DELETE_INDEX_IFTAIL]: [81, 82, 83],
      [TAGS.DELETE_INDEX_TRAVERSE]: [85, 86, 87],
      [TAGS.DELETE_INDEX_UNLINK]: [89, 90, 91],
      [TAGS.DELETE_INDEX_END]: [92],

      [TAGS.SEARCH_START]: [94],
      [TAGS.SEARCH_COMPARE]: [97, 98, 99, 100],
      [TAGS.SEARCH_FOUND]: [98],
      [TAGS.SEARCH_NEXT]: [99, 100],
      [TAGS.SEARCH_NOT_FOUND]: [102],
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

    def insert_at_head(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = self.tail = new_node
        else:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node

    def insert_at_tail(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = self.tail = new_node
        else:
            self.tail.next = new_node
            new_node.prev = self.tail
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
        if current.next:
            current.next.prev = new_node
        new_node.prev = current
        current.next = new_node
        if new_node.next is None:
            self.tail = new_node

    def delete_at_head(self):
        if not self.head: return
        self.head = self.head.next
        if self.head:
            self.head.prev = None
        else:
            self.tail = None

    def delete_at_tail(self):
        if not self.head: return
        if not self.head.next:
            self.head = self.tail = None
            return
        self.tail = self.tail.prev
        self.tail.next = None

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
        else:
            self.tail = current.prev

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
      { lineNumber: 12, complexity: 'O(1)'                  },  // def insert_at_head(self, value):
      { lineNumber: 13, complexity: 'O(1)'                  },  // new_node = Node(value)
      { lineNumber: 14, complexity: 'O(1)'                  },  // if not self.head
      { lineNumber: 15, complexity: 'O(1)'                  },  // self.head = self.tail = new_node
      { lineNumber: 16, complexity: 'O(1)'                  },  // else
      { lineNumber: 17, complexity: 'O(1)'                  },  // new_node.next = self.head
      { lineNumber: 18, complexity: 'O(1)'                  },  // self.head.prev = new_node
      { lineNumber: 19, complexity: 'O(1)'                  },  // self.head = new_node
      { lineNumber: 21, complexity: 'O(1)'                  },  // def insert_at_tail(self, value):
      { lineNumber: 22, complexity: 'O(1)'                  },  // new_node = Node(value)
      { lineNumber: 23, complexity: 'O(1)'                  },  // if not self.head
      { lineNumber: 24, complexity: 'O(1)'                  },  // self.head = self.tail = new_node
      { lineNumber: 25, complexity: 'O(1)'                  },  // else
      { lineNumber: 26, complexity: 'O(1)'                  },  // self.tail.next = new_node
      { lineNumber: 27, complexity: 'O(1)'                  },  // new_node.prev = self.tail
      { lineNumber: 28, complexity: 'O(1)'                  },  // self.tail = new_node
      { lineNumber: 30, complexity: 'O(n)'                  },  // def insert_at_index(self, index, value): — overall O(n)
      { lineNumber: 31, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 32, complexity: 'O(1)'                  },  // self.insert_at_head — before loop
      { lineNumber: 33, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 34, complexity: 'O(1)'                  },  // new_node = Node(value) — before loop
      { lineNumber: 35, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 36, complexity: 'O(n)'                  },  // for _ in range(index-1) — top-level for
      { lineNumber: 37, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 38, complexity: 'O(1)'                  },  // new_node.next = current.next — after loop
      { lineNumber: 39, complexity: 'O(1)'                  },  // if current.next — after loop
      { lineNumber: 40, complexity: 'O(1)'                  },  // current.next.prev = new_node — after loop
      { lineNumber: 41, complexity: 'O(1)'                  },  // new_node.prev = current — after loop
      { lineNumber: 42, complexity: 'O(1)'                  },  // current.next = new_node — after loop
      { lineNumber: 43, complexity: 'O(1)'                  },  // if new_node.next is None — after loop
      { lineNumber: 44, complexity: 'O(1)'                  },  // self.tail = new_node — after loop
      { lineNumber: 46, complexity: 'O(1)'                  },  // def delete_at_head(self):
      { lineNumber: 47, complexity: 'O(1)'                  },  // if not self.head: return
      { lineNumber: 48, complexity: 'O(1)'                  },  // self.head = self.head.next
      { lineNumber: 49, complexity: 'O(1)'                  },  // if self.head
      { lineNumber: 50, complexity: 'O(1)'                  },  // self.head.prev = None
      { lineNumber: 51, complexity: 'O(1)'                  },  // else
      { lineNumber: 52, complexity: 'O(1)'                  },  // self.tail = None
      { lineNumber: 54, complexity: 'O(1)'                  },  // def delete_at_tail(self):
      { lineNumber: 55, complexity: 'O(1)'                  },  // if not self.head: return
      { lineNumber: 56, complexity: 'O(1)'                  },  // if not self.head.next
      { lineNumber: 57, complexity: 'O(1)'                  },  // self.head = self.tail = None
      { lineNumber: 58, complexity: 'O(1)'                  },  // return
      { lineNumber: 59, complexity: 'O(1)'                  },  // self.tail = self.tail.prev
      { lineNumber: 60, complexity: 'O(1)'                  },  // self.tail.next = None
      { lineNumber: 62, complexity: 'O(n)'                  },  // def delete_at_index(self, index): — overall O(n)
      { lineNumber: 63, complexity: 'O(1)'                  },  // if index == 0 — before loop
      { lineNumber: 64, complexity: 'O(1)'                  },  // self.delete_at_head() — before loop
      { lineNumber: 65, complexity: 'O(1)'                  },  // return — before loop
      { lineNumber: 66, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 67, complexity: 'O(n)'                  },  // for i in range(index) — top-level for
      { lineNumber: 68, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 69, complexity: 'O(1)'                  },  // current.prev.next = current.next — after loop
      { lineNumber: 70, complexity: 'O(1)'                  },  // if current.next — after loop
      { lineNumber: 71, complexity: 'O(1)'                  },  // current.next.prev = current.prev — after loop
      { lineNumber: 72, complexity: 'O(1)'                  },  // else — after loop
      { lineNumber: 73, complexity: 'O(1)'                  },  // self.tail = current.prev — after loop
      { lineNumber: 75, complexity: 'O(n)'                  },  // def search(self, value): — overall O(n)
      { lineNumber: 76, complexity: 'O(1)'                  },  // current = self.head — before loop
      { lineNumber: 77, complexity: 'O(1)'                  },  // index = 0 — before loop
      { lineNumber: 78, complexity: 'O(n)'                  },  // while current — top-level while
      { lineNumber: 79, complexity: 'O(1)', context: 'O(n)' },  // if current.value == value — O(1) × n
      { lineNumber: 80, complexity: 'O(1)', context: 'O(n)' },  // current = current.next — O(1) × n
      { lineNumber: 81, complexity: 'O(1)', context: 'O(n)' },  // index += 1 — O(1) × n
      { lineNumber: 82, complexity: 'O(1)'                  },  // return -1 — after loop
    ],
  },
};
