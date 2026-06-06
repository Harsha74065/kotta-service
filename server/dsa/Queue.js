/**
 * Queue — FIFO (First In, First Out)
 *
 *   enqueue(x): add to back    — O(1)
 *   dequeue():  remove front   — O(1) using a head index
 *   peek():     view front     — O(1)
 *
 * Used in: GET /api/dsa-demo
 *   We enqueue all PENDING services (in arrival order) and dequeue to show
 *   a "first-come, first-served" list — the opposite of the priority queue.
 *
 * Real-life analogy: people standing in a billing queue at a shop.
 */
class Queue {
  constructor() {
    this.items = [];
    this.head = 0;
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    if (this.head >= this.items.length) return undefined;
    const item = this.items[this.head];
    this.head++;
    return item;
  }

  peek() {
    if (this.head >= this.items.length) return undefined;
    return this.items[this.head];
  }

  size() { return this.items.length - this.head; }
  isEmpty() { return this.size() === 0; }
}

module.exports = Queue;
