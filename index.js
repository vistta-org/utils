export const isEqual = (arg1, arg2) => {
  if (typeof arg1 !== typeof arg2) return false;
  if (Array.isArray(arg1) && Array.isArray(arg2)) {
    if (arg1.length !== arg2.length) return false;
    for (let i = 0; i < arg1.length; i++) {
      if (!isEqual(arg1[i], arg2[i])) return false;
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
      if (!isEqual(arg1[key], arg2[key])) return false;
    }
    return true;
  }
  return arg1 === arg2;
};

export const isPromise = (f) => f instanceof Promise;

export const isAsync = (f) => f.constructor.name === "AsyncFunction";

export const setImmediate = (callback) => Promise.resolve().then(callback);

export const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export * from "./object.js";
export * from "./string.js";
