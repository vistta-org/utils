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
 * Checks if an object is plain.
 *
 * @param {Object} object - The object to check.
 * @returns {boolean} Whether the object is plain.
 */
export function isPlainObject(object) {
  return Object.prototype.toString.call(object) === "[object Object]";
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
    duplicateReplacer(),
    !formatted ? null : formatted === true ? 4 : formatted
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

/**
 * Recursively assigns properties of object `b` to object `a`.
 *
 * @param {Object} a - The target object to which properties will be assigned.
 * @param {Object} b - The source object from which properties will be assigned.
 * @returns {Object} - The modified target object `a`.
 */
export function assign(a, b) {
  if (b == null) return a;
  if (!isPlainObject(a) || !isPlainObject(b)) return b;

  const keys = Object.keys(b);
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    if (isPlainObject(b[key])) {
      if (!a[key]) a[key] = {};
      a[key] = assign(a[key], b[key]);
    } else {
      a[key] = b[key];
    }
  }
  return a;
}

/**
 * Extracts the specified keys from the given object and deletes them from the object.
 *
 * @param {Object} object - The object from which to extract and delete keys.
 * @param {...string} keys - The keys to extract and delete from the object.
 * @returns {Array} - An array containing the values of the extracted keys.
 */
export function extract(object, ...keys) {
  const result = [];
  for (let i = 0, len = keys.length; i < len; i++) {
    result.push(object[keys[i]]);
    delete object[keys[i]];
  }
  return result;
}

/**
 * Removes the specified keys from the given object.
 *
 * @param {Object} object - The object from which to remove keys.
 * @param {...string} keys - The keys to remove from the object.
 */
export function remove(object, ...keys) {
  for (let i = 0, len = keys.length; i < len; i++) delete object[keys[i]];
}

/**
 * Creates a proxy for an object that intercepts get and set operations.
 * @param {Object} obj - The object to proxy.
 * @param {Object} options - Options for the proxy.
 * @param {function} [options.apply] - A trap for a function call.
 * @param {function} [options.construct] - A trap for the new operator.
 * @param {function} [options.defineProperty] - A trap for Object.defineProperty.
 * @param {function} [options.deleteProperty] - A trap for the delete operator.
 * @param {function} [options.get] - A trap for getting property values.
 * @param {function} [options.getOwnPropertyDescriptor] - A trap for Object.getOwnPropertyDescriptor.
 * @param {function} [options.getPrototypeOf] - A trap for Object.getPrototypeOf.
 * @param {function} [options.has] - A trap for the in operator.
 * @param {function} [options.isExtensible] - A trap for Object.isExtensible.
 * @param {function} [options.ownKeys] - A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
 * @param {function} [options.preventExtensions] - A trap for Object.preventExtensions.
 * @param {function} [options.set] - A trap for setting property values.
 * @param {function} [options.setPrototypeOf] - A trap for Object.setPrototypeOf.
 * @param {boolean} [options.recursive=true] - Whether to wrap nested objects in proxies.
 * @param {boolean} [options.readonly] - If true, the proxy will not allow setting properties.
 * @returns {Proxy} A proxy for the object.
 */
export function proxy(target, options = {}) {
  const seen = new WeakMap();
  function helper(obj, path) {
    if (typeof obj !== "object" || obj === null) return obj;
    if (seen.has(obj)) return seen.get(obj);
    const handlers = {};
    if (options.apply)
      handlers.apply = (target, thisArg, args) =>
        options.apply.call(target, path, thisArg, args, () =>
          Reflect.apply(target, thisArg, args)
        );
    if (options.construct)
      handlers.construct = (target, args, newTarget) =>
        options.construct.call(target, path, args, newTarget, () =>
          Reflect.construct(target, args, newTarget)
        );
    handlers.defineProperty = (target, property, descriptor) => {
      if (!options.defineProperty) return false;
      const fullPath = [...path, property];
      return options.defineProperty.call(target, fullPath, descriptor, () =>
        Reflect.defineProperty(target, property, descriptor)
      );
    };
    if (options.deleteProperty || options.readonly)
      handlers.deleteProperty = (target, property) => {
        if (options.readonly) return false;
        const fullPath = [...path, property];
        return options.deleteProperty.call(target, fullPath, () =>
          Reflect.deleteProperty(target, property)
        );
      };
    if (options.get)
      handlers.get = (target, property, receiver) => {
        let value = Reflect.get(target, property, receiver);
        const fullPath = [...path, property];
        if (
          options.recursive !== false &&
          typeof value === "object" &&
          value !== null
        )
          value = helper(value, fullPath);
        return options.get.call(target, fullPath, value, () => value);
      };
    if (options.getOwnPropertyDescriptor)
      handlers.getOwnPropertyDescriptor = (target, property) =>
        options.getOwnPropertyDescriptor.call(target, [...path, property], () =>
          Reflect.getOwnPropertyDescriptor(target, property)
        );
    if (options.getPrototypeOf)
      handlers.getPrototypeOf = (target) =>
        options.getPrototypeOf.call(target, path, () =>
          Reflect.getPrototypeOf(target)
        );
    if (options.has)
      handlers.has = (target, property) =>
        options.has.call(target, [...path, property], () =>
          Reflect.has(target, property)
        );
    if (options.isExtensible)
      handlers.isExtensible = (target) =>
        options.isExtensible.call(target, path, () =>
          Reflect.isExtensible(target)
        );
    if (options.ownKeys)
      handlers.ownKeys = (target) =>
        options.ownKeys.call(target, path, () => Reflect.ownKeys(target));
    if (options.preventExtensions)
      handlers.preventExtensions = (target) =>
        options.preventExtensions.call(target, path, () =>
          Reflect.preventExtensions(target)
        );
    if (options.set || options.readonly)
      handlers.set = (target, property, value, receiver) => {
        if (options.readonly) return false;
        const oldValue = target[property];
        const fullPath = [...path, property];
        const newValue =
          options.recursive !== false &&
          typeof value === "object" &&
          value !== null
            ? helper(value, fullPath)
            : value;
        return options.set.call(target, fullPath, newValue, oldValue, () =>
          Reflect.set(target, property, newValue, receiver)
        );
      };
    handlers.setPrototypeOf = (target, prototype) => {
      if (!options.setPrototypeOf) return false;
      return options.setPrototypeOf.call(target, path, prototype, () =>
        Reflect.setPrototypeOf(target, prototype)
      );
    };
    const result = new Proxy(obj, handlers);
    seen.set(obj, result);
    return result;
  }
  return helper(target, []);
}

function duplicateReplacer(set = new WeakSet()) {
  return function (_, value) {
    if (typeof value === "object" && value !== null) {
      if (set.has(value)) {
        return;
      }
      set.add(value);
    }
    return value;
  };
}
