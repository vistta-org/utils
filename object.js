/**
 * Checks if a value is an object.
 *
 * @param {any} object - The value to check.
 * @returns {boolean} Whether the value is an object.
 */
export function isObject(object) {
  return object != null && typeof object === "object";
}

/**
 * Checks if an object is empty.
 *
 * @param {Object} object - The object to check.
 * @returns {boolean} Whether the object is empty.
 */
export function isObjectEmpty(object) {
  return Object.keys(object).length === 0;
}

/**
 * Stringifies an object.
 *
 * @param {Object} object - The object to stringify.
 * @param {boolean} [formatted] - Whether to format the output.
 * @returns {string} The stringified object.
 */
export function stringify(object, formatted = false) {
  return JSON.stringify(
    object,
    (() => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return;
          seen.add(value);
        }
        return value;
      };
    })(),
    !formatted ? null : formatted === true ? 4 : formatted,
  );
}

/**
 * Parses a stringified object.
 *
 * @param {string} object - The stringified object.
 * @param {boolean} [secure] - Whether to use secure parsing.
 * @returns {Object} The parsed object.
 */
export function parse(object, secure = false) {
  if (!secure) return JSON.parse(object);
  try {
    return JSON.parse(object);
  } catch {
    return {};
  }
}

/**
 * Clones an object.
 *
 * @param {Object} object - The object to clone.
 * @param {boolean} [json] - Whether to use JSON parsing.
 * @returns {Object} The cloned object.
 */
export function clone(object, json) {
  return json ? parse(stringify(object)) : structuredClone(object);
}

/**
 * Copies the property descriptors of one object to another.
 *
 * @param {Object} object - The object to copy properties to.
 * @param {Object} target - The object to copy properties from.
 * @returns {Object} The object with the copied properties.
 */
export function copyPropertyDescriptors(object, target) {
  const targetDescriptors = Object.getOwnPropertyDescriptors(target);

  const objectKeys = Object.keys(object);
  for (let i = 0, len = objectKeys.length; i < len; i++)
    delete object[objectKeys[i]];

  const targetKeys = Object.keys(targetDescriptors);
  for (let i = 0, len = targetKeys.length; i < len; i++)
    Object.defineProperty(
      object,
      targetKeys[i],
      targetDescriptors[targetKeys[i]],
    );

  return object;
}

/**
 * Flattens an object.
 *
 * @param {Object} object - The object to flatten.
 * @param {string} [separator] - The separator to use for nested keys.
 * @param {function} [transformer] - A function to transform keys.
 * @returns {Object} The flattened object.
 */
export function flatten(object, separator = ".", transformer) {
  const helper = (target, prefix) => {
    let flattened = {};
    const keys = Object.keys(target || {});
    for (let i = 0, len = keys.length; i < len; i++) {
      const _key = keys[i];
      let key = typeof transformer === "function" ? transformer(_key) : _key;
      if (prefix) key = `${prefix}${separator}${key}`;
      if (typeof target[_key] === "object" && target[_key] !== null)
        flattened = { ...flattened, ...helper(target[_key], key) };
      else flattened[key] = target[_key];
    }
    return flattened;
  };
  return helper(object);
}
