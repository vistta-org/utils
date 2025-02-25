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
  for (let i = 0, len = array.length; i < len; i++)
    if (array[i] === value) return;
  array.push(value);
}