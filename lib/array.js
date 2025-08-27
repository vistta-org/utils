/**
 * Ensure that the given value is an array. If it is not an array, it will be wrapped in an array.
 *
 * @param {any} value - The value to ensure is an array.
 * @returns {Array} - The value as an array.
 */
export function ensureArray(value) {
  if (!Array.isArray(value)) return [value];
  return value;
}

/**
 * Add the given value to the array if it is not already present.
 *
 * @param {Array} array - The array to add the value to.
 * @param {any} value - The value to add to the array.
 */
export function addUnique(array, value) {
  for (let i = 0, len = array.length; i < len; i++) if (array[i] === value) return;
  array.push(value);
}

/**
 * Insert anything into the array sorted.
 * @param {Array} array - The array to insert into.
 * @param {any} value - The value to insert.
 * @param {Function} [compare] - The comparison function to use. It should return a negative number if a is less than b, a positive number if a is greater than b, and 0 if they are equal.
 *
 */
export function insertSorted(array, value, compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
  if (array.length === 0) {
    array.push(value);
    return;
  }
  for (let i = 0, len = array.length; i < len; i++) {
    if (compare(value, array[i]) < 0) {
      array.splice(i, 0, value);
      return;
    }
  }
  array.push(value);
}