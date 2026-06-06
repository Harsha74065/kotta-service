/**
 * Singly Linked List
 *
 * Each Node holds a value and a pointer to the next Node.
 *
 *   append(value): O(1) — add to the tail
 *   toArray():     O(n) — walk the chain
 *
 * Used in: GET /api/dsa-demo
 *   We chain a customer's services in order (oldest -> newest), so each
 *   node points to the next visit. This is the textbook "history chain" use case.
 */
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  append(value) {
    const node = new Node(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }

  toArray() {
    const out = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.value);
      cur = cur.next;
    }
    return out;
  }
}

module.exports = { LinkedList, Node };
