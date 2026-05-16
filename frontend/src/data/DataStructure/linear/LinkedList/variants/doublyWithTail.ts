import type { CodeConfig } from "@/types";
import type { LinkedListVariant } from "./types";
import { createLinkedListSteps } from "./createLinkedListSteps";

const TAGS = {
  INSERT_HEAD_START: "DBT_INSERT_HEAD_START",
  INSERT_HEAD_CREATE: "DBT_INSERT_HEAD_CREATE",
  INSERT_HEAD_LINK: "DBT_INSERT_HEAD_LINK",
  INSERT_HEAD_LINK_PREV: "DBT_INSERT_HEAD_LINK_PREV",
  INSERT_HEAD_UPDATE: "DBT_INSERT_HEAD_UPDATE",
  INSERT_HEAD_UPDATE_ISNULL: "DBT_INSERT_HEAD_UPDATE_ISNULL",
  INSERT_HEAD_UPDATE_NOTNULL: "DBT_INSERT_HEAD_UPDATE_NOTNULL",
  INSERT_HEAD_UPDATE_TAIL: "DBT_INSERT_HEAD_UPDATE_TAIL",
  INSERT_HEAD_END: "DBT_INSERT_HEAD_END",
  INSERT_TAIL_START: "DBT_INSERT_TAIL_START",
  INSERT_TAIL_TRAVERSE: "DBT_INSERT_TAIL_TRAVERSE",
  INSERT_TAIL_CREATE: "DBT_INSERT_TAIL_CREATE",
  INSERT_TAIL_UPDATE_ISNULL_TRUE: "DBT_INSERT_TAIL_UPDATE_ISNULL_TRUE",
  INSERT_TAIL_CREATE_NEW_NODE_ISNULL: "DBT_INSERT_TAIL_CREATE_NEW_NODE_ISNULL",
  INSERT_TAIL_UPDATE_HEAD_ISNULL: "DBT_INSERT_TAIL_UPDATE_HEAD_ISNULL",
  INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL: "DBT_INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL",
  INSERT_TAIL_LINK: "DBT_INSERT_TAIL_LINK",
  INSERT_TAIL_LINK_PREV: "DBT_INSERT_TAIL_LINK_PREV",
  INSERT_TAIL_POINTER_MOVE: "DBT_INSERT_TAIL_POINTER_MOVE",
  INSERT_TAIL_END: "DBT_INSERT_TAIL_END",
  INSERT_INDEX_START: "DBT_INSERT_INDEX_START",
  INSERT_INDEX_IFZERO: "DBT_INSERT_INDEX_IFZERO",
  INSERT_INDEX_IFTAIL: "DBT_INSERT_INDEX_IFTAIL",
  INSERT_INDEX_TRAVERSE: "DBT_INSERT_INDEX_TRAVERSE",
  INSERT_INDEX_CREATE: "DBT_INSERT_INDEX_CREATE",
  INSERT_INDEX_LINK: "DBT_INSERT_INDEX_LINK",
  INSERT_INDEX_LINK_PREV: "DBT_INSERT_INDEX_LINK_PREV",
  INSERT_INDEX_LINK_NEW_NEXT: "DBT_INSERT_INDEX_LINK_NEW_NEXT",
  INSERT_INDEX_LINK_NEXT_PREV: "DBT_INSERT_INDEX_LINK_NEXT_PREV",
  INSERT_INDEX_LINK_CURRENT_NEXT: "DBT_INSERT_INDEX_LINK_CURRENT_NEXT",
  INSERT_INDEX_LINK_NEW_PREV: "DBT_INSERT_INDEX_LINK_NEW_PREV",
  INSERT_INDEX_UPDATE_TAIL: "DBT_INSERT_INDEX_UPDATE_TAIL",
  INSERT_INDEX_END: "DBT_INSERT_INDEX_END",
  DELETE_HEAD_START: "DBT_DELETE_HEAD_START",
  DELETE_HEAD_CHECK: "DBT_DELETE_HEAD_CHECK",
  DELETE_HEAD_UPDATE_HEAD: "DBT_DELETE_HEAD_UPDATE_HEAD",
  DELETE_HEAD_UPDATE_PREV: "DBT_DELETE_HEAD_UPDATE_PREV",
  DELETE_HEAD_UPDATE_TAIL: "DBT_DELETE_HEAD_UPDATE_TAIL",
  DELETE_HEAD_FREE: "DBT_DELETE_HEAD_FREE",
  DELETE_HEAD_END: "DBT_DELETE_HEAD_END",
  DELETE_TAIL_START: "DBT_DELETE_TAIL_START",
  DELETE_TAIL_ISNEXTNULL: "DBT_DELETE_TAIL_ISNEXTNULL",
  DELETE_TAIL_ISNEXTNULL_REMOVE: "DBT_DELETE_TAIL_ISNEXTNULL_REMOVE",
  DELETE_TAIL_TRAVERSE: "DBT_DELETE_TAIL_TRAVERSE",
  DELETE_TAIL_UNLINK: "DBT_DELETE_TAIL_UNLINK",
  DELETE_TAIL_SINGLE: "DBT_DELETE_TAIL_SINGLE",
  DELETE_TAIL_END: "DBT_DELETE_TAIL_END",
  DELETE_INDEX_START: "DBT_DELETE_INDEX_START",
  DELETE_INDEX_IFZERO: "DBT_DELETE_INDEX_IFZERO",
  DELETE_INDEX_IFTAIL: "DBT_DELETE_INDEX_IFTAIL",
  DELETE_INDEX_TRAVERSE: "DBT_DELETE_INDEX_TRAVERSE",
  DELETE_INDEX_UNLINK: "DBT_DELETE_INDEX_UNLINK",
  DELETE_INDEX_END: "DBT_DELETE_INDEX_END",
  SEARCH_START: "DBT_SEARCH_START",
  SEARCH_COMPARE: "DBT_SEARCH_COMPARE",
  SEARCH_FOUND: "DBT_SEARCH_FOUND",
  SEARCH_NEXT: "DBT_SEARCH_NEXT",
  SEARCH_NOT_FOUND: "DBT_SEARCH_NOT_FOUND",
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
  },
};

export const doublyWithTailVariant: LinkedListVariant = {
  TAGS,
  codeConfig,
  createAnimationSteps(dataList, action) {
    return createLinkedListSteps(
      dataList,
      action,
      TAGS as unknown as Record<string, string>,
      true,
      true,
    );
  },
};
