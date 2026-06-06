/**
 * Linear Search and Binary Search.
 *
 * Linear Search — O(n)
 *   Walk the array and return the first item that matches.
 *   Works on ANY array, sorted or not.
 *
 * Binary Search — O(log n)
 *   Works only on a SORTED array. Each step we look at the middle element
 *   and throw away half the array.
 *
 * Used in: GET /api/dsa-demo
 *   • linearSearch finds a customer whose phone CONTAINS the query.
 *   • binarySearch finds a service by its `id` (services are pre-sorted by id).
 */
function linearSearch(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) return { index: i, item: arr[i] };
  }
  return { index: -1, item: null };
}

function binarySearch(sortedArr, target, getKey = (x) => x) {
  let low = 0;
  let high = sortedArr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midKey = getKey(sortedArr[mid]);
    if (midKey === target) return { index: mid, item: sortedArr[mid] };
    if (midKey < target) low = mid + 1;
    else high = mid - 1;
  }
  return { index: -1, item: null };
}

module.exports = { linearSearch, binarySearch };
