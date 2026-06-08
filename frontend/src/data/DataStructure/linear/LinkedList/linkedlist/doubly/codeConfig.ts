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
  },
};
