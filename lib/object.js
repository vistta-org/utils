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
  return JSON.stringify(object, duplicateReplacer(), !formatted ? null : formatted === true ? 4 : formatted);
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
 * Recursively assigns properties of sources objects to the target object.
 *
 * @param {Object} target - The target object to which properties will be assigned.
 * @param {...Object} sources - The source objects from which properties will be copied.
 * @returns {Object} - The modified target object `a`.
 */
export function assign(target, ...sources) {
  if (!isPlainObject(target)) return null;
  for (let i = 0, len = sources.length; i < len; i++) {
    if (sources[i] == null || !isPlainObject(sources[i])) continue;
    const keys = Object.keys(sources[i]);
    for (let j = 0, klen = keys.length; j < klen; j++) {
      const key = keys[j];
      if (isPlainObject(sources[i][key])) {
        if (!target[key]) target[key] = {};
        target[key] = assign(target[key], sources[i][key]);
      } else {
        target[key] = sources[i][key];
      }
    }
  }
  return target;
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
 * @param {Object} target - The object to proxy.
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
    const result = new Proxy(obj, {
      apply: options.apply
        ? (source, thisArg, args) => options.apply.call(source, path, thisArg, args, () => source.apply(thisArg, ...args))
        : undefined,
      construct: options.construct
        ? (source, args) => options.construct.call(source, path, args, () => new source(...args))
        : undefined,
      defineProperty: (source, property, descriptor) => {
        if (!options.defineProperty) return Reflect.defineProperty(source, property, descriptor);
        const fullPath = [...path, property];
        return options.defineProperty.call(source, fullPath, descriptor, () =>
          Reflect.defineProperty(source, property, descriptor),
        );
      },
      deleteProperty: (source, property) => {
        if (options.readonly) return true;
        if (!options.deleteProperty) return Reflect.deleteProperty(source, property);
        const fullPath = [...path, property];
        return options.deleteProperty.call(source, fullPath, () => Reflect.deleteProperty(source, property));
      },
      get: (source, property) => {
        let value = Reflect.get(source, property);
        const fullPath = [...path, property];
        if (options.recursive !== false && typeof value === "object" && value !== null) value = helper(value, fullPath);
        if (options.get) return options.get.call(source, fullPath, value);
        return value;
      },
      getOwnPropertyDescriptor: options.getOwnPropertyDescriptor
        ? (source, property) =>
            options.getOwnPropertyDescriptor.call(
              source,
              [...path, property],
              Reflect.getOwnPropertyDescriptor(source, property),
            )
        : undefined,
      getPrototypeOf: options.getPrototypeOf
        ? (source) => {
            if (!Object.isExtensible(source)) return Reflect.getPrototypeOf(source);
            return options.getPrototypeOf.call(source, path, Reflect.getPrototypeOf(source));
          }
        : undefined,
      has: options.has
        ? (source, property) => options.has.call(source, [...path, property], Reflect.has(source, property))
        : undefined,
      isExtensible: options.isExtensible
        ? (source) => options.isExtensible.call(source, path, Reflect.isExtensible(source))
        : undefined,
      ownKeys: options.ownKeys ? (source) => options.ownKeys.call(source, path, Reflect.ownKeys(source)) : undefined,
      preventExtensions: options.preventExtensions
        ? (source) => options.preventExtensions.call(source, path, Reflect.preventExtensions(source))
        : undefined,
      set: (source, property, newValue) => {
        if (options.readonly) return true;
        if (!options.set) Reflect.set(source, property, newValue);
        return options.set.call(
          source,
          [...path, property],
          newValue,
          typeof source[property] === "object" ? { ...source[property] } : source[property],
          () => Reflect.set(source, property, newValue),
        );
      },
      setPrototypeOf: options.setPrototypeOf
        ? (source, prototype) =>
            options.setPrototypeOf.call(source, path, prototype, () => Reflect.setPrototypeOf(source, prototype))
        : undefined,
    });
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
