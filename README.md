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

### console

```typescript
class Console {
  /**
   * @returns {typeof Console} Console Instance Class.
   */
  get Console();

  /**
   * @returns {string[]} Console instance logs
   */
  get logs();

  /**
   * Creates a new Console instance.
   *
   * @typedef {Object} Options
   * @property {WritableStreamDefaultWriter} [writer] - Writable Stream.
   * @property {Function} [clear] - Function to clear the Stream if available.
   * @property {boolean} [date] - Whether to include the date in logs. Defaults to true.
   * @property {boolean | COLORS} [colors] - Whether to include colors in logs or object of the colors. Defaults to true if no writer is passed.
   * @property {boolean} [trace] - Whether to include the stack trace in logs. Defaults to the value of the `NODE_TRACE` environment variable.
   * @property {boolean} [debug] - Whether to enable debug mode. Defaults to the value of the `NODE_DEBUG` environment variable.
   * @property {number} [index] - The index of the console. Defaults to 0.
   *
   * @param {Options} [options] - Optional configuration options or true for system default.
   */
  constructor(options);

  /**
   * Announces a message.
   *
   * @param {...any} data - The message to announce.
   */
  announce(...data);

  /**
   * Asserts a condition.
   *
   * @param {boolean} condition - The condition to assert.
   * @param {...any} data - The message to log if the condition fails.
   */
  assert(condition, ...data);

  /**
   * Clears the console.
   */
  clear();

  /**
   * Increments a counter for the given key.
   *
   * @param {string} [key] - The key of the counter.
   */
  count(key = "");

  /**
   * Resets the counter for the given key.
   *
   * @param {string} [key] - The key of the counter.
   */
  countReset(key = "");

  /**
   * Logs a message.
   *
   * @param {...any} data - The message to log.
   */
  print(...data);

  /**
   * Logs a new line.
   */
  println();

  /**
   * Logs a debug message.
   *
   * @param {...any} data - The message to log.
   */
  debug(...data);

  /**
   * Logs an object.
   *
   * @param {Object} object - The object to log.
   */
  dir(object);

  /**
   * Logs an XML object.
   *
   * @param {Object} object - The XML object to log.
   */
  dirxml(object);

  /**
   * Logs an error message.
   *
   * @param {...any} data - The error message.
   */
  error(...data);

  /**
   * Starts a new group of logs.
   *
   * @param {...any} data - The message to log for the group header.
   */
  group(...data);

  /**
   * Starts a new group of logs.
   *
   * @param {...any} data - The message to log for the group header.
   */
  groupCollapsed(...data);

  /**
   * Ends a group of logs.
   */
  groupEnd();

  /**
   * Logs an information message.
   *
   * @param {...any} data - The message to log.
   */
  info(...data);

  /**
   * Logs a message.
   *
   * @param {...any} data - The success message.
   */
  log(...data);

  /**
   * Starts a profile measurement.
   *
   * @param {string} key - The key of the profile measurement.
   * @param {boolean} [force] - Overwrites existing keys.
   */
  profile(key, force);

  /**
   * Ends a profile measurement.
   *
   * @param {string} key - The key of the profile measurement.
   */
  profileEnd(key, print = true);

  /**
   * Logs a success message.
   *
   * @param {...any} data - The success message.
   */
  success(...data);

  /**
   * Logs a table.
   *
   * @param {Array<any>} data - The data to log as a table.
   * @param {string} properties - The properties to include in the table header.
   */
  table(data, properties);

  /**
   * Logs a time measurement start.
   *
   * @param {string} key - The key of the time measurement.
   * @param {boolean} [force] - Overwrites existing keys.
   */
  time(key, force = false);

  /**
   * Logs a time measurement end.
   *
   * @param {string} key - The key of the time measurement.
   * @param {boolean} print - Whether to print the time difference. Defaults to true.
   */
  timeEnd(key, print = true);

  /**
   * Logs a time measurement log.
   *
   * @param {string} key - The key of the time measurement.
   * @param {...any} data - The message to log.
   */
  timeLog(key, ...data);

  /**
   * Logs a timestamp.
   *
   * @param {string} key - The key of the time measurement.
   */
  timeStamp(key);

  /**
   * Logs a trace message.
   *
   * @param {...any} data - The message to log.
   */
  trace(...data);

  /**
   * Logs a warning message.
   *
   * @param {...any} data - The warning message.
   */
  warn(...data);
}

/**
 * Object containing ANSI escape codes for text formatting.
 */
const colors = {
  /**
   * @returns {string} Code to reset the console color.
   */
  reset,

  /**
   * @returns {string} Code to make the text bright.
   */
  bright,

  /**
   * @returns {string} Code to make the text dim.
   */
  dim,

  /**
   * @returns {string} Code to underline the text.
   */
  underscore,

  /**
   * @returns {string} Code to blink the text.
   */
  blink,

  /**
   * @returns {string} Code to reverse the text color.
   */
  reverse,

  /**
   * @returns {string} Code to set the text color to black.
   */
  black,

  /**
   * @returns {string} Code to set the text color to red.
   */
  red,

  /**
   * @returns {string} Code to set the text color to green.
   */
  green,

  /**
   * @returns {string} Code to set the text color to yellow.
   */
  yellow,

  /**
   * @returns {string} Code to set the text color to blue.
   */
  blue,

  /**
   * @returns {string} Code to set the text color to magenta.
   */
  magenta,

  /**
   * @returns {string} Code to set the text color to cyan.
   */
  cyan,

  /**
   * @returns {string} Code to set the text color to white.
   */
  white,
};
```

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
   * @returns {DateTime} The date and time with the earliest time value.
   */
  static min(a, b);

  /**
   * Returns the later of two date and time objects.
   *
   * @param {DateTime} a The first date and time object.
   * @param {DateTime} b The second date and time object.
   * @returns {DateTime} The date and time with the latest time value.
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
   * @returns {number} The difference between the two date and times.
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

### fs

```typescript
/**
 * Checks if a file or directory exists.
 *
 * @param {string | Buffer | URL} path - The path to the file or directory.
 * @param {number} [mode] - The access mode.
 * @returns {Promise<void>}
 */
fs.access(path, mode);

/**
 * Checks if a file or directory exists synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the file or directory.
 * @param {number} [mode] - The access mode.
 * @returns {void}
 */
fs.accessSync(path, mode);

/**
 * Appends data to a file.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {string | Uint8Array} data - The data to append.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<void>}
 */
fs.appendFile(path, data, options);

/**
 * Appends data to a file synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {string | Uint8Array} data - The data to append.
 * @param {Object} [options] - Options for the operation.
 * @returns {void}
 */
fs.appendFileSync(path, data, options);

/**
 * Returns the last component of a path.
 *
 * @param {string} path - The path.
 * @param {string} [suffix] - an extension to remove from the result.
 * @returns {string}
 */
fs.basename(path, suffix);

/**
 * Changes the file mode of a file or directory.
 *
 * @param {string | Buffer | URL} path - The path to the file or directory.
 * @param {number} mode - The new file mode.
 * @returns {Promise<void>}
 */
fs.chmod(path, mode);

/**
 * Changes the file mode of a file or directory synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the file or directory.
 * @param {number} mode - The new file mode.
 * @returns {void}
 */
fs.chmodSync(path, mode);

/**
 * Changes the ownership of a file or directory.
 *
 * @param {string | Buffer | URL} path - The path to the file or directory.
 * @param {number} uid - The new user ID.
 * @param {number} gid - The new group ID.
 * @returns {Promise<void>}
 */
fs.chown(path, uid, gid);

/**
 * Changes the ownership of a file or directory synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the file or directory.
 * @param {number} uid - The new user ID.
 * @param {number} gid - The new group ID.
 * @returns {void}
 */
fs.chownSync(path, uid, gid);

/**
 * Closes a file synchronously.
 *
 * @param {number} fd - The file descriptor.
 * @returns {void}
 */
fs.closeSync(fd);

/**
 * Copies a file.
 *
 * @param {string | Buffer | URL} source - The path to the source file or directory.
 * @param {string | Buffer | URL} destination - The path to the destination file or directory.
 * @param {number} [mode] - Optional modifiers that specify the behavior of the copy operation. It is possible to create a mask consisting of the bitwise OR of two or more values (e.g. fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE)
 * @returns {Promise<void>}
 */
fs.copyFile(source, destination, mode);

/**
 * Copies a file synchronously.
 *
 * @param {string | Buffer | URL} source - The path to the source file or directory.
 * @param {string | Buffer | URL} destination - The path to the destination file or directory.
 * @param {number} [mode] - modifiers for copy operation.
 * @returns {void}
 */
fs.copyFileSync(source, destination, mode);

/**
 * Copies a file or directory.
 *
 * @param {string | URL} source - The path to the source file or directory.
 * @param {string | URL} destination - The path to the destination file or directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<void>}
 */
fs.cp(source, destination, options);

/**
 * Copies a file or directory synchronously.
 *
 * @param {string | URL} source - The path to the source file or directory.
 * @param {string | URL} destination - The path to the destination file or directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {void}
 */
fs.cpSync(source, destination, options);

/**
 * Provides constants used in the file system module.
 */
fs.constantsnodeFs?.constants;

/**
 * Checks if a file or directory exists synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the file or directory.
 * @returns {boolean}
 */
fs.existsSync(path);

/**
 * Returns the file extension.
 *
 * @param {string} path - The path to the file.
 * @returns {string}
 */
fs.extname(path);

/**
 * Changes the file mode of a file synchronously.
 *
 * @param {number} fd - The file descriptor.
 * @param {number | string} mode - The new file mode.
 * @returns {void}
 */
fs.fchmodSync(fd, mode);

/**
 * Changes the ownership of a file synchronously.
 *
 * @param {number} fd - The file descriptor.
 * @param {number} uid - The new user ID.
 * @param {number} gid - The new group ID.
 * @returns {void}
 */
fs.fchownSync(fd, uid, gid);

/**
 * Fetches any pending data to the underlying file.
 *
 * @param {number} fd - The file descriptor.
 * @returns {void}
 */
fs.fdatasyncSync(fd);

/**
 * Returns the filename portion of a file path.
 *
 * @param {string | URL} url - The file URL.
 * @returns {string}
 */
fs.filename(url);

/**
 * Gets the file status of a file synchronously.
 *
 * @param {number} fd - The file descriptor.
 * @param {Object} [options] - Options for the operation..
 * @returns {Object}
 */
fs.fstatSync(fd, options);

/**
 * Flushes any pending data to the underlying file.
 *
 * @param {number} fd - The file descriptor.
 * @returns {void}
 */
fs.fsyncSync(fd);

/**
 * Truncates a file to a specified length.
 *
 * @param {number} fd - The file descriptor.
 * @param {number} [length] - The new file length.
 * @returns {void}
 */
fs.ftruncateSync(fd, length);

/**
 * Sets the file access and modification times.
 *
 * @param {number} fd - The file descriptor.
 * @param {string | number | Date} atime - The new access time.
 * @param {string | number | Date} mtime - The new modification time.
 * @returns {void}
 */
fs.futimesSync(fd, atime, mtime);

/**
 * Finds files based on a glob pattern.
 *
 * @param {string} pattern - The glob pattern.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<string[]>}
 */
// @ts-ignore
fs.glob(pattern, options);

/**
 * Finds files based on a glob pattern.
 *
 * @param {string} pattern - The glob pattern.
 * @param {Object} [options] - Options for the operation.
 * @returns {string[]}
 */
// @ts-ignore
fs.globSync(pattern, options);

/**
 * Checks if a path is absolute.
 *
 * @param {string} path - The path to check.
 * @returns {boolean}
 */
fs.isAbsolute(path);

/**
 * Changes the ownership of a symbolic link.
 *
 * @param {string | Buffer | URL} path
 * @param {number} uid - The new user ID.
 * @param {number} gid - The new group ID.
 * @returns {Promise<void>}
 */
fs.lchown(path, uid, gid);

/**
 * Changes the ownership of a symbolic link.
 *
 * @param {string | Buffer | URL} path
 * @param {number} uid - The new user ID.
 * @param {number} gid - The new group ID.
 * @returns {void}
 */
fs.lchownSync(path, uid, gid);

/**
 * Change the file system timestamps of the symbolic link referenced by path.
 *
 * @param {string | Buffer | URL} path
 * @param {string | number | Date} atime - The new access time.
 * @param {string | number | Date} mtime - The new modification time.
 * @returns {Promise<void>}
 */
fs.lutimes(path, atime, mtime);

/**
 * Change the file system timestamps of the symbolic link referenced by path.
 *
 * @param {string | Buffer | URL} path
 * @param {string | number | Date} atime - The new access time.
 * @param {string | number | Date} mtime - The new modification time.
 * @returns {void}
 */
fs.lutimesSync(path, atime, mtime);

/**
 * Creates a symbolic link.
 *
 * @param {string | Buffer | URL} existingPath - The target path.
 * @param {string | Buffer | URL} newPath - The path to the symbolic link.
 * @returns {Promise<void>}
 */
fs.link(existingPath, newPath);

/**
 * Creates a symbolic link synchronously.
 *
 * @param {string | Buffer | URL} existingPath - The target path.
 * @param {string | Buffer | URL} newPath - The path to the symbolic link.
 * @returns {void}
 */
fs.linkSync(existingPath, newPath);

/**
 * Creates a directory.
 *
 * @param {string | Buffer | URL} path - The path to the directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<string>}
 */
fs.mkdir(path, options);

/**
 * Creates a directory synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {string}
 */
fs.mkdirSync(path, options);

/**
 * Creates an unique temporary directory.
 *
 * @param {string} prefix - The path to the directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<string>}
 */
fs.mkdtemp(prefix, options);

/**
 * Creates an unique temporary directory synchronously.
 *
 * @param {string} prefix - The path to the directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {string}
 */
fs.mkdtempSync(prefix, options);

/**
 * Opens a file.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {number} [flags] - The file flags.
 * @param {string | number} [mode] - Options for the operation.
 * @returns {Promise<Object>}
 */
fs.open(path, flags, mode);

/**
 * Opens a file synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {number} [flags] - The file flags.
 * @param {string | number} [mode] - Options for the operation.
 * @returns {Object}
 */
fs.openSync(path, flags, mode);

/**
 * Opens a directory.
 *
 * @param {string | Buffer | URL} path - Path to the directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<Object>} Promise that resolves to a directory object.
 */
fs.opendir(path, options);

/**
 * Opens a directory synchronously.
 *
 * @param {string | Buffer | URL} path - Path to the directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {Object} Promise that resolves to a directory object.
 */
fs.opendirSync(path, options);

/**
 * Reads the contents of a directory.
 *
 * @param {string | Buffer | URL} path - Path to the directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<string[]>} Promise that resolves to an array of file names.
 */
fs.readdir(path, options);

/**
 * Reads the contents of a directory synchronously.
 *
 * @param {string | Buffer | URL} path - Path to the directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {string[]} Array of file names.
 */
fs.readdirSync(path, options);

/**
 * Reads the entire contents of a file.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {Object} options - Options for the operation, if options is a string, then it specifies the encoding.
 * @returns {Promise<Buffer>}
 */
fs.readFile(path, options);

/**
 * Reads the entire contents of a file synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {Object} options - Options for the operation, if options is a string, then it specifies the encoding.
 * @returns {Buffer}
 */
fs.readFileSync(path, options);

/**
 * Reads the target of a symbolic link.
 *
 * @param {string | Buffer | URL} path - The path to the symbolic link.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<string>}
 */
fs.readlink(path, options);

/**
 * Reads the target of a symbolic link synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the symbolic link.
 * @param {Object} [options] - Options for the operation.
 * @returns {string}
 */
fs.readlinkSync(path, options);

/**
 * Returns the number of `bytesRead`.
 *
 * @param {number} fd - The file descriptor.
 * @param {Buffer} buffer - buffer.
 * @param {number} offset - offset.
 * @param {number} length - length.
 * @param {number} position - position.
 * @returns {number} Buffer containing the file data.
 */
fs.readSync(fd, buffer, offset, length, position);

/**
 * Reads a file asynchronously using the `uv_readv()` method.
 *
 * @param {number} fd - The file descriptor.
 * @param {Buffer[]} buffers - buffers.
 * @param {number} [position] - position.
 * @returns {number} The number of bytes read.
 */
fs.readvSync(fd, buffers, position);

/**
 * Resolves a path to an absolute path.
 *
 * @param {string | Buffer | URL} path - Path to resolve.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<string>} Promise that resolves to the resolved path.
 */
fs.realpath(path, options);

/**
 * Resolves a path to an absolute path synchronously.
 *
 * @param {string | Buffer | URL} path - Path to resolve.
 * @param {Object} [options] - Options for the operation.
 * @returns {string} Resolved path.
 */
fs.realpathSync(path, options);

/**
 * Resolves a path to an absolute path synchronously using the native `realpath()` function.
 *
 * @param {string | Buffer | URL} path - Path to resolve.
 * @param {Object} [options] - Options for the operation.
 * @returns {string} Resolved path.
 */
fs.realpathSync.native(path, options);

/**
 *  Renames a file or directory.
 *
 * @param {string | Buffer | URL} oldPath - The path to the source file or directory.
 * @param {string | Buffer | URL} newPath - The path to the destination file or directory.
 * @returns {Promise<void>}
 */
fs.rename(oldPath, newPath);

/**
 * Renames a file or directory synchronously.
 *
 * @param {string | Buffer | URL} oldPath - The path to the source file or directory.
 * @param {string | Buffer | URL} newPath - The path to the destination file or directory.
 * @returns {void}
 */
fs.renameSync(oldPath, newPath);

/**
 * Resolves a sequence of paths or path segments into an absolute path.
 *
 * @param {string[]} paths - A sequence of paths or path segments.
 * @returns {string}
 */
fs.resolve(...paths);

/**
 * Removes a directory.
 *
 * @param {string | Buffer | URL} path - The path to the directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<void>}
 */
fs.rmdir(path, options);

/**
 * Removes a directory synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {void}
 */
fs.rmdirSync(path, options);

/**
 * Removes a file or directory.
 *
 * @param {string | Buffer | URL} path - Path to the file or directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {Promise<void>} Promise that resolves when the file or directory is removed.
 */
fs.rm(path, options);

/**
 * Removes a file or directory synchronously.
 *
 * @param {string | Buffer | URL} path - Path to the file or directory.
 * @param {Object} [options] - Options for the operation.
 * @returns {void}
 */
fs.rmSync(path, options);

/**
 * Gets the file status of a file.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {Object | Boolean} [options] - Options for the operation, if options is a true, then it specifies the follow Link.
 * @returns {Promise<Object>}
 */
fs.stat(path, options);

/**
 * Gets the file status of a file synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {Object | Boolean} [options] - Options for the operation, if options is a true, then it specifies the follow Link.
 * @returns {Object}
 */
fs.statSync(path, options);

/**
 * Creates a symbolic link.
 *
 * @param {string | Buffer | URL} target - The target path.
 * @param {string | Buffer | URL} path - The path to the symbolic link.
 * @param {"dir" | "file" | "junction"} type - Options for the operation.
 * @returns {Promise<void>}
 */
fs.symlink(target, path, type);

/**
 * Creates a symbolic link synchronously.
 *
 * @param {string | Buffer | URL} target - The target path.
 * @param {string | Buffer | URL} path - The path to the symbolic link.
 * @param {"dir" | "file" | "junction"} type - Options for the operation.
 * @returns {void}
 */
fs.symlinkSync(target, path, type);

/**
 * Truncates a file to a specified length.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {number} [length] - The new file length.
 * @returns {Promise<void>}
 */
fs.truncate(path, length);

/**
 * Truncates a file to a specified length synchronously.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {number} [length] - The new file length.
 * @returns {void}
 */
fs.truncateSync(path, length);

/**
 * Removes a file.
 *
 * @param {string | Buffer | URL} path - Path to the file.
 * @returns {Promise<void>} Promise that resolves when the file is removed.
 */
fs.unlink(path);

/**
 * Removes a file synchronously.
 *
 * @param {string | Buffer | URL} path - Path to the file.
 */
fs.unlinkSync(path);

/**
 * Sets the file access and modification times.
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {string | number | Date} atime - The new access time.
 * @param {string | number | Date} mtime - The new modification time.
 * @returns {Promise<void>}
 */
fs.utimes(path, atime, mtime);

/**
 * Sets the file access and modification times.
 *
 * @param {string | Buffer | URL} path - The path to the file.
 * @param {Date} atime - The new access time.
 * @param {Date} mtime - The new modification time.
 * @returns {void}
 */
fs.utimesSync(path, atime, mtime);

/**
 * Writes data to a file.
 *
 * @param {string | Buffer | URL} path - Path to the file.
 * @param {string | Buffer} data - Data to write to the file.
 * @param {Object} options - Options for writing the file, if options is a string, then it specifies the encoding.
 * @returns {Promise<void>} Promise that resolves when the file is written.
 */
fs.writeFile(path, data, options);

/**
 * Writes data to a file synchronously.
 *
 * @param {string} path - Path to the file.
 * @param {string | Buffer} data - Data to write to the file.
 * @param {Object} options - Options for writing the file, if options is a string, then it specifies the encoding.
 */
fs.writeFileSync(path, data, options);

/**
 * Writes data to a file synchronously.
 *
 * @param {number} fd - The file descriptor.
 * @param {Buffer} buffer - buffer.
 * @param {number} offset - offset.
 * @param {number} length - length.
 * @param {number} position - position.
 * @returns {number} Buffer containing the file data.
 */
fs.writeSync(fd, buffer, offset, length, position);

/**
 * Writes data asynchronously using the `uv_writev()` method.
 *
 * @param {number} fd - The file descriptor.
 * @param {Buffer[]} buffers - buffers.
 * @param {number} [position] - position.
 * @returns {number} The number of bytes read.
 */
fs.writevSync(fd, buffers, position);

/**
 * Return the directory name of a path or url. Similar to the Unix dirname command.
 *
 * @param {string | URL} path the path or url to evaluate.
 * @return the directory name of a path or url. Similar to the Unix dirname command.
 */
fs.dirname(path);

/**
 * Checks if a path is a directory.
 *
 * @param {string | Buffer | URL} path - The path to check.
 * @returns {boolean} True if the path is a directory, false otherwise.
 */
fs.isDirectory(path);

/**
 * Checks if a path is a file.
 *
 * @param {string | Buffer | URL} path - The path to check.
 * @returns {boolean} True if the path is a file, false otherwise.
 */
fs.isFile(path);

/**
 * Returns a 32bit unique ID from the filepath provided.
 *
 * @param {string | Buffer | URL} path - The path of the file.
 * @returns {string | null} A 32bit unique ID or null if the file does not exist.
 */
fs.fileId(path);

/**
 * Watches a directory for changes.
 *
 * @param {string} path - The path to watch.
 * @param {Object} [options] - Optional options.
 * @param {RegExp} [options.ignore] - A regular expression to ignore certain files.
 * @param {number} [options.throttle] - The throttle in milliseconds between file checks.
 * @returns {any} An iterator that yields the paths of changed files.
 */
fs.watch(path, options);
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
