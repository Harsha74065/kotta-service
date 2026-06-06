/**
 * Simple recursion examples.
 *
 * Every recursive function has TWO parts:
 *   1. Base case  — when to STOP
 *   2. Recursive case — call the function again with a smaller input
 *
 * Used in: GET /api/dsa-demo
 *   • factorial(5)         — classic interview demo
 *   • recursiveSum(ids)    — sum of all service ids
 *   • recursiveCount(arr)  — count services where status === 'completed'
 */

function factorial(n) {
  if (n <= 1) return 1;            // base case
  return n * factorial(n - 1);     // recursive case
}

function recursiveSum(arr, i = 0) {
  if (i >= arr.length) return 0;                  // base case
  return arr[i] + recursiveSum(arr, i + 1);       // recursive case
}

function recursiveCount(arr, predicate, i = 0) {
  if (i >= arr.length) return 0;                  // base case
  const inc = predicate(arr[i]) ? 1 : 0;
  return inc + recursiveCount(arr, predicate, i + 1);
}

module.exports = { factorial, recursiveSum, recursiveCount };
