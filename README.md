# **VISTTA Utils**

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

### datetime

```typescript
/**
 * Creates a new date and time object with default date format.
 *
 * @param {Date|number|string|DateTime} [value] - The date and time value.
 * @param {Intl.DateTimeFormatOptions} [options] - The options for the date and time.
 * @returns {DateTime} A new date and time object.
 */
function date(value, options);

/**
 * Creates a new date and time object with default time format.
 *
 * @param {Date|number|string|DateTime} [value] - The date and time value.
 * @param {Intl.DateTimeFormatOptions} [options] - The options for the date and time.
 * @returns {DateTime} A new date and time object.
 */
function time(value, options);

/**
 * A class representing a date and time.
 */
class DateTime {
  /**
   * Returns the earlier of two date and time objects.
   *
   * @param {DateTime} a The first date and time object.
   * @param {DateTime} b The second date and time object.
   * @returns {DateTime | null} The date and time with the earliest time value.
   */
  static min(a, b);

  /**
   * Returns the later of two date and time objects.
   *
   * @param {DateTime} a The first date and time object.
   * @param {DateTime} b The second date and time object.
   * @returns {DateTime | null} The date and time with the latest time value.
   */
  static max(a, b);

  /**
   * Checks if two date and time objects are equal.
   *
   * @param {DateTime} a The first date and time object.
   * @param {DateTime} b The second date and time object.
   * @returns {boolean} Whether both date and time objects are equal.
   */
  static equals(a, b);

  /**
   * Gets the current time in in milliseconds since the Unix epoch.
   * 
   * @returns {number} The time in in milliseconds since the Unix epoch.
   */
  static now();

  /**
   * Creates a new DateTime instance.
   *
   * @param {Date|number|string|DateTime} [value] - The date and time value.
   * @param {Intl.DateTimeFormatOptions} [options] - The options for the date and time.
   */
  constructor(value, options);

  /**
   * @returns {number} The year of the date and time.
   */
  get year();

  /**
   * @param {number} value - The new year of the date and time.
   */
  set year(value);

  /**
   * @returns {number} The month of the date and time.
   */
  get month();

  /**
   * @param {number} value - The new month of the date and time.
   */
  set month(value);

  /**
   * @returns {number} The day of the month of the date and time.
   */
  get day();

  /**
   * @param {number} value - The new day of the month of the date and time.
   */
  set day(value);

  /**
   * @returns {number} The hour of the date and time.
   */
  get hours();

  /**
   * @param {number} value - The new hour of the date and time.
   */
  set hours(value);

  /**
   * @returns {number} The minute of the date and time.
   */
  get minutes();

  /**
   * @param {number} value - The new minute of the date and time.
   */
  set minutes(value);

  /**
   * @returns {Date} A Date object representing the current date and time.
   */
  get date();

  /**
   * @returns {Intl.DateTimeFormatOptions} The date and time format options.
   */
  get options();

  /**
   * @returns {number} The time in in milliseconds since the Unix epoch.
   */
  get time();

  /**
   * Gets the ISO 8601 formatted date and time.
   *
   * @returns {string} The ISO 8601 formatted date and time.
   */
  toISOString();

  /**
   * Formats the date according to the default or the specified locales.
   *
   * @param {string} [locales] - The locale to use for formatting.
   * @returns {string} The formatted date and time.
   */
  toString(locales);

  /**
   * Formats the date according to the default or the specified options.
   *
   * @param {LocaleOptions & Intl.DateTimeFormatOptions} [options] - The Intl.DateTimeFormat options object.
   * @returns {string} The formatted date and time.
   */
  format(options);

  /**
   * Checks whether the date and time is equal to the target date and time.
   *
   * @param {DateTime} target - Comparison target.
   * @returns {boolean} Whether the date and time is equal to the target date and time.
   */
  equals(target);

  /**
   * Creates a deep copy of the current DateTime object.
   *
   * @returns {DateTime} A new date and time object that is a clone of the current object.
   */
  clone();

  /**
   * Calculates the difference between two date and times (e.g., years, months, days, hours, minutes, seconds).
   *
   * @param {DateTime} target - The target date and time.
   * @param {string} output - The output format.
   * @param {boolean} [float] - Whether to use floating-point numbers.
   * @returns {number | null} The difference between the two date and times.
   */
  diff(target, output, float);

  /**
   * Gets the relative time from the reference date (e.g., "just now", "in an hour", etc.).
   *
   * @param {RelativeOptions & Intl.RelativeTimeFormatOptions} options - The options for relative time calculations.
   * @returns {string} The relative time from the reference date.
   */
  relative(options);
}
```

### generic

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
 * A base class that automatically binds all methods to the instance.
 * 
 * This class iterates over all the methods of the instance and binds them
 * to the instance itself, ensuring that the `this` context is always correct
 * when the methods are called.
 */
class BoundClass {
  /**
   * Creates an instance of BoundClass.
   * 
   * The constructor retrieves all the method names from the prototype of the instance,
   * and binds each method to the instance, except for the constructor.
   */
  constructor();
}
```

### object

```typescript
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
 * Copies the property descriptor of one object to another.
 *
 * @param {Object} object - The object to copy property to.
 * @param {Object} target - The object to copy property from.
 * @param {string} propertyName - The property name.
 * @returns {Object} The object with the copied property.
 */
function copyPropertyDescriptor(object, target, propertyName);

/**
 * Flattens an object.
 *
 * @param {Object} object - The object to flatten.
 * @param {string} [separator] - The separator to use for nested keys.
 * @param {function} [transformer] - A function to transform keys.
 * @returns {Object} The flattened object.
 */
function flatten(object, separator, transformer);
```

### promise

```typescript
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
 * Converts any function or value into Async
 *
 * @param {any} value - Value to convert into a Async.
 * @returns {Promise<any>} Promise.
 */
function async(value);
```

### request

```typescript
/**
 * Sends an HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @param {string} [options.method] The HTTP method for the request (e.g. GET, POST).
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
function request(url, options);

/**
 * Sends a GET HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response data.
 */
function request.get(url, options);

/**
 * Sends a POST HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response data.
 */
function request.post(url, options);

/**
 * Sends a HEAD HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response data.
 */
function request.head(url, options);

/**
 * Sends a PUT HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response data.
 */
function request.put(url, options);

/**
 * Sends a DELETE HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response data.
 */
function request.delete(url, options);

/**
 * Sends a CONNECT HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response data.
 */
function request.connect(url, options);

/**
 * Sends an OPTIONS HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response data.
 */
function request.options(url, options);

/**
 * Sends a TRACE HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response data.
 */
function request.trace(url, options);

/**
 * Sends a PATCH HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response data.
 */
function request.patch(url, options);
```

### string

```typescript
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

## **License**

Attribution-NonCommercial-NoDerivatives 4.0 International

## **Contributing**

Thank you for your interest in contributing to this project! Please ensure that any contributions respect the licensing terms specified. If you encounter any issues or have suggestions, feel free to report them. All issues will be well received and addressed to the best of our ability. We appreciate your support and contributions!

### **Authors**

- [Tiago Terenas Almeida](https://github.com/tiagomta)
