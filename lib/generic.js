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

/**
 * A base class that automatically binds all methods to the instance.
 *
 * This class iterates over all the methods of the instance and binds them
 * to the instance itself, ensuring that the `this` context is always correct
 * when the methods are called.
 */
export class BoundClass {
  /**
   * Creates an instance of BoundClass.
   *
   * The constructor retrieves all the method names from the prototype of the instance,
   * and binds each method to the instance, except for the constructor.
   */
  constructor() {
    const prototype = Object.getPrototypeOf(this);
    const functions = Object.getOwnPropertyNames(prototype);
    for (let i = 0, len = functions.length; i < len; i++) {
      if (functions[i] === "constructor") continue;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, functions[i]);
      if (typeof descriptor.get === "undefined" && typeof descriptor.set === "undefined") this[functions[i]] = this[functions[i]].bind(this);
    }
  }
}
