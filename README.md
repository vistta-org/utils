# **Vistta Utils**

Utility library/package bundle

## **Getting Started**

### **Install**

```sh
npm install @vistta/utils
```

### **Usage**

```javascript
import { sleep, clone } from "@vistta/utils";

await sleep(5000);

const obj = { key: "value" };
const newObj = clone(obj);

console.log(capitalize("hello world!"));
```

## **API**

```typescript
/**
 * Checks if two values are equal.
 *
 * @param {any} arg1 - The first value.
 * @param {any} arg2 - The second value.
 * @returns {boolean} Whether the two values are equal.
 */
function equals(arg1, arg2);

/**
 * Checks if a value is a Promise.
 *
 * @param {any} f - The value to check.
 * @returns {boolean} Whether the value is a Promise.
 */
function isPromise(f);

/**
 * Checks if a value is an async function.
 *
 * @param {function} f - The value to check.
 * @returns {boolean} Whether the value is an async function.
 */
function isAsync(f);

/**
 * Sets an immediate timeout.
 *
 * @param {function} callback - The callback function to execute.
 * @returns {Promise} A promise that resolves when the callback is executed.
 */
function setImmediate(callback);

/**
 * Delays execution for a specified amount of milliseconds.
 *
 * @param {number} milliseconds - The number of milliseconds to delay execution.
 * @returns {Promise} A promise that resolves after the specified time.
 */
function sleep(milliseconds);

/**
 * Checks if a value is an object.
 *
 * @param {any} object - The value to check.
 * @returns {boolean} Whether the value is an object.
 */
function isObject(object);

/**
 * Checks if an object is empty.
 *
 * @param {Object} object - The object to check.
 * @returns {boolean} Whether the object is empty.
 */
function isObjectEmpty(object);

/**
 * Stringifies an object.
 *
 * @param {Object} object - The object to stringify.
 * @param {boolean} [formatted] - Whether to format the output.
 * @returns {string} The stringified object.
 */
function stringify(object, formatted = false);

/**
 * Parses a stringified object.
 *
 * @param {string} object - The stringified object.
 * @param {boolean} [secure] - Whether to use secure parsing.
 * @returns {Object} The parsed object.
 */
function parse(object, secure = false);

/**
 * Clones an object.
 *
 * @param {Object} object - The object to clone.
 * @param {boolean} [json] - Whether to use JSON parsing.
 * @returns {Object} The cloned object.
 */
function clone(object, json);

/**
 * Copies the property descriptors of one object to another.
 *
 * @param {Object} object - The object to copy properties to.
 * @param {Object} target - The object to copy properties from.
 * @returns {Object} The object with the copied properties.
 */
function copyPropertyDescriptors(object, target);

/**
 * Flattens an object.
 *
 * @param {Object} object - The object to flatten.
 * @param {string} [separator] - The separator to use for nested keys.
 * @param {function} [transformer] - A function to transform keys.
 * @returns {Object} The flattened object.
 */
function flatten(object, separator, transformer);

/**
 * Encodes a string using a specified encoding.
 *
 * @param {string} string - The string to encode.
 * @param {"base64" | "hex" | "ascii" | "binary"} [encoding] - The encoding to use. Defaults to "base64".
 * @returns {string} The encoded string.
 */
function encode(string, encoding = "base64");

/**
 * Decodes a string using a specified encoding.
 *
 * @param {string} data - The string to decode.
 * @param {"base64" | "hex" | "ascii" | "binary"} [encoding] - The encoding to use. Defaults to "base64".
 * @returns {string} The decoded string.
 */
function decode(data, encoding = "base64");

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} string - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(string);

/**
 * Abbreviates a number or string.
 *
 * @param {string | number} input - The number or string to abbreviate.
 * @returns {string} The abbreviated string.
 */
function abbreviate(input);

/**
 * Checks if a string is a valid IP address.
 *
 * @param {string} string - The string to check.
 * @returns {boolean} Whether the string is a valid IP address.
 */
function isIPAddress(string);

/**
 * Checks if a string is a valid URL.
 *
 * @param {string} string - The string to check.
 * @returns {boolean} Whether the string is a valid URL.
 */
function isValidUrl(string);

/**
 * Checks if a string is a valid URL pathname.
 *
 * @param {string} string - The string to check.
 * @returns {boolean} Whether the string is a valid URL pathname.
 */
function isValidUrlPathname(string);
```

### **Also included**

[Vistta Console](../console/README.md)

[Vistta Date-Time](../date-time/README.md)

[Vistta FS](../fs/README.md)

## **License**

Attribution-NonCommercial-NoDerivatives 4.0 International

## **Contributing**

Thank you for your interest in contributing to this project! Please ensure that any contributions respect the licensing terms specified. If you encounter any issues or have suggestions, feel free to report them. All issues will be well received and addressed to the best of our ability. We appreciate your support and contributions!

### **Authors**

- [Tiago Terenas Almeida](https://github.com/tiagomta)
