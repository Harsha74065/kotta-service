/**
 * Stack — LIFO (Last In, First Out)
 *
 *   push(x): add to top    — O(1)
 *   pop():   remove top    — O(1)
 *   peek():  view top      — O(1)
 *
 * Used in: GET /api/dsa-demo
 *   We push activity-log rows then pop them, which gives newest-first order.
 *   (This is the same idea as the browser "Back" button.)
 */
class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    if (this.items.length === 0) return undefined;
    return this.items.pop();
  }

  peek() {
    if (this.items.length === 0) return undefined;
    return this.items[this.items.length - 1];
  }

  size() { return this.items.length; }
  isEmpty() { return this.items.length === 0; }
  toArray() { return [...this.items]; }
}

module.exports = Stack;
