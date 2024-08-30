/**
 * Checks if two values are equal.
 *
 * @param {any} arg1 - The first value.
 * @param {any} arg2 - The second value.
 * @returns {boolean} Whether the two values are equal.
 */
export function equals(arg1, arg2) {
  if (typeof arg1 !== typeof arg2) return false;
  if (Array.isArray(arg1) && Array.isArray(arg2)) {
    if (arg1.length !== arg2.length) return false;
    for (let i = 0; i < arg1.length; i++) {
      if (!equals(arg1[i], arg2[i])) return false;
    }
    return true;
  }
  if (arg1 == null || arg2 == null) return arg1 === arg2;
  if (typeof arg1 === "object" && typeof arg2 === "object") {
    if (arg1.constructor !== arg2.constructor) return false;
    // Custom Constructors Comparation
    if (arg1 instanceof Date) return arg1.getTime() === arg2.getTime();
    // Normal Comparation
    if (Object.keys(arg1).length !== Object.keys(arg2).length) return false;
    for (const key in arg1) {
      if (!equals(arg1[key], arg2[key])) return false;
    }
    return true;
  }
  return arg1 === arg2;
}

/**
 * Checks if a value is a Promise.
 *
 * @param {any} f - The value to check.
 * @returns {boolean} Whether the value is a Promise.
 */
export function isPromise(f) {
  return f instanceof Promise;
}

/**
 * Checks if a value is an async function.
 *
 * @param {function} f - The value to check.
 * @returns {boolean} Whether the value is an async function.
 */
export function isAsync(f) {
  return f.constructor.name === "AsyncFunction";
}

/**
 * Sets an immediate timeout.
 *
 * @param {function} callback - The callback function to execute.
 * @returns {Promise} A promise that resolves when the callback is executed.
 */
export function setImmediate(callback) {
  return Promise.resolve().then(callback);
}

/**
 * Delays execution for a specified amount of milliseconds.
 *
 * @param {number} milliseconds - The number of milliseconds to delay execution.
 * @returns {Promise} A promise that resolves after the specified time.
 */
export function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export * from "./object.js";
export * from "./string.js";
