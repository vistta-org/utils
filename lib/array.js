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
 * @returns {number} - The index at which the value was inserted.
 */
export function insertSorted(array, value, compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
  if (array.length === 0) return array.push(value) - 1;
  for (let i = 0, len = array.length; i < len; i++) {
    if (compare(value, array[i]) < 0) return (array.splice(i, 0, value), i);
  }
  return array.push(value) - 1;
}

/**
 * Advanced join for arrays with a transformer function.
 * @param {Array} array - The array to join.
 * @param {string} [separator=","] - The separator to use between elements.
 * @param {Function} [transformer=(v) => v] - The transformer function to apply to each element before joining.
 * @returns {string} - The joined string.
 */
export function join(array, separator = ",", transformer = (v) => v) {
  let result = "";
  for (let i = 0, len = array.length; i < len; i++) {
    const cur = transformer(array[i], i, array);
    if (cur != null && cur !== false) result += cur + separator;
  }
  return result.slice(0, -separator.length);
}
