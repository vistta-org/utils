export const isObject = (object) =>
  object != null && typeof object === "object";

export const isObjectEmpty = (object) => Object.keys(object).length === 0;

export const stringify = (object, formatted = false) =>
  JSON.stringify(
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

export const parse = (object, secure = false) => {
  if (!secure) return JSON.parse(object);
  try {
    return JSON.parse(object);
  } catch {
    return {};
  }
};

export const clone = (object, json) =>
  json ? parse(stringify(object)) : structuredClone(object);

export const copyPropertyDescriptors = (object, target) => {
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
};

export const flatten = (object, separator, transformer) => {
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
};
