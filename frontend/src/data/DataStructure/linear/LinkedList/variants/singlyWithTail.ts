import type { CodeConfig } from "@/types";
import type { LinkedListVariant } from "./types";
import { createLinkedListSteps } from "./createLinkedListSteps";

const TAGS = {
  INSERT_HEAD_START: "SGT_INSERT_HEAD_START",
  INSERT_HEAD_CREATE: "SGT_INSERT_HEAD_CREATE",
  INSERT_HEAD_LINK: "SGT_INSERT_HEAD_LINK",
  INSERT_HEAD_LINK_PREV: "SGT_INSERT_HEAD_LINK_PREV",
  INSERT_HEAD_UPDATE: "SGT_INSERT_HEAD_UPDATE",
  INSERT_HEAD_UPDATE_ISNULL: "SGT_INSERT_HEAD_UPDATE_ISNULL",
  INSERT_HEAD_UPDATE_NOTNULL: "SGT_INSERT_HEAD_UPDATE_NOTNULL",
  INSERT_HEAD_UPDATE_TAIL: "SGT_INSERT_HEAD_UPDATE_TAIL",
  INSERT_HEAD_END: "SGT_INSERT_HEAD_END",
  INSERT_TAIL_START: "SGT_INSERT_TAIL_START",
  INSERT_TAIL_TRAVERSE: "SGT_INSERT_TAIL_TRAVERSE",
  INSERT_TAIL_CREATE: "SGT_INSERT_TAIL_CREATE",
  INSERT_TAIL_UPDATE_ISNULL_TRUE: "SGT_INSERT_TAIL_UPDATE_ISNULL_TRUE",
  INSERT_TAIL_CREATE_NEW_NODE_ISNULL: "SGT_INSERT_TAIL_CREATE_NEW_NODE_ISNULL",
  INSERT_TAIL_UPDATE_HEAD_ISNULL: "SGT_INSERT_TAIL_UPDATE_HEAD_ISNULL",
  INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL: "SGT_INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL",
  INSERT_TAIL_LINK: "SGT_INSERT_TAIL_LINK",
  INSERT_TAIL_LINK_PREV: "SGT_INSERT_TAIL_LINK_PREV",
  INSERT_TAIL_POINTER_MOVE: "SGT_INSERT_TAIL_POINTER_MOVE",
  INSERT_TAIL_END: "SGT_INSERT_TAIL_END",
  INSERT_INDEX_START: "SGT_INSERT_INDEX_START",
  INSERT_INDEX_IFZERO: "SGT_INSERT_INDEX_IFZERO",
  INSERT_INDEX_IFTAIL: "SGT_INSERT_INDEX_IFTAIL",
  INSERT_INDEX_TRAVERSE: "SGT_INSERT_INDEX_TRAVERSE",
  INSERT_INDEX_CREATE: "SGT_INSERT_INDEX_CREATE",
  INSERT_INDEX_LINK: "SGT_INSERT_INDEX_LINK",
  INSERT_INDEX_LINK_PREV: "SGT_INSERT_INDEX_LINK_PREV",
  INSERT_INDEX_LINK_NEW_NEXT: "SGT_INSERT_INDEX_LINK_NEW_NEXT",
  INSERT_INDEX_LINK_NEXT_PREV: "SGT_INSERT_INDEX_LINK_NEXT_PREV",
  INSERT_INDEX_LINK_CURRENT_NEXT: "SGT_INSERT_INDEX_LINK_CURRENT_NEXT",
  INSERT_INDEX_LINK_NEW_PREV: "SGT_INSERT_INDEX_LINK_NEW_PREV",
  INSERT_INDEX_UPDATE_TAIL: "SGT_INSERT_INDEX_UPDATE_TAIL",
  INSERT_INDEX_END: "SGT_INSERT_INDEX_END",
  DELETE_HEAD_START: "SGT_DELETE_HEAD_START",
  DELETE_HEAD_CHECK: "SGT_DELETE_HEAD_CHECK",
  DELETE_HEAD_UPDATE_HEAD: "SGT_DELETE_HEAD_UPDATE_HEAD",
  DELETE_HEAD_UPDATE_PREV: "SGT_DELETE_HEAD_UPDATE_PREV",
  DELETE_HEAD_UPDATE_TAIL: "SGT_DELETE_HEAD_UPDATE_TAIL",
  DELETE_HEAD_FREE: "SGT_DELETE_HEAD_FREE",
  DELETE_HEAD_END: "SGT_DELETE_HEAD_END",
  DELETE_TAIL_START: "SGT_DELETE_TAIL_START",
  DELETE_TAIL_ISNEXTNULL: "SGT_DELETE_TAIL_ISNEXTNULL",
  DELETE_TAIL_ISNEXTNULL_REMOVE: "SGT_DELETE_TAIL_ISNEXTNULL_REMOVE",
  DELETE_TAIL_TRAVERSE: "SGT_DELETE_TAIL_TRAVERSE",
  DELETE_TAIL_UNLINK: "SGT_DELETE_TAIL_UNLINK",
  DELETE_TAIL_SINGLE: "SGT_DELETE_TAIL_SINGLE",
  DELETE_TAIL_END: "SGT_DELETE_TAIL_END",
  DELETE_INDEX_START: "SGT_DELETE_INDEX_START",
  DELETE_INDEX_IFZERO: "SGT_DELETE_INDEX_IFZERO",
  DELETE_INDEX_IFTAIL: "SGT_DELETE_INDEX_IFTAIL",
  DELETE_INDEX_TRAVERSE: "SGT_DELETE_INDEX_TRAVERSE",
  DELETE_INDEX_UNLINK: "SGT_DELETE_INDEX_UNLINK",
  DELETE_INDEX_END: "SGT_DELETE_INDEX_END",
  SEARCH_START: "SGT_SEARCH_START",
  SEARCH_COMPARE: "SGT_SEARCH_COMPARE",
  SEARCH_FOUND: "SGT_SEARCH_FOUND",
  SEARCH_NEXT: "SGT_SEARCH_NEXT",
  SEARCH_NOT_FOUND: "SGT_SEARCH_NOT_FOUND",
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
    },
  };

export const singlyWithTailVariant: LinkedListVariant = {
  TAGS,
  codeConfig,
  createAnimationSteps(dataList, action) {
    return createLinkedListSteps(
      dataList,
      action,
      TAGS as unknown as Record<string, string>,
      false,
      true,
    );
  },
};
