/**
 * Bubble Sort — basic sorting algorithm.
 *
 *   Time:  O(n^2) worst/average, O(n) if already sorted
 *   Space: O(1)
 *
 * Idea: repeatedly walk the array, swapping any two adjacent items that
 * are in the wrong order. After each pass, the largest item "bubbles" to
 * the end. We stop early if a pass made no swaps (already sorted).
 *
 * Used in: GET /api/dsa-demo
 *   We sort technicians by their active workload (ascending), so the
 *   least-busy person appears first.
 */
function bubbleSort(arr, getKey = (x) => x) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (getKey(a[j]) > getKey(a[j + 1])) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}

module.exports = { bubbleSort };
