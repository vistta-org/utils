/**
 * Encodes a string using a specified encoding.
 *
 * @param {string} string - The string to encode.
 * @param {"base64" | "hex" | "ascii" | "binary"} [encoding] - The encoding to use. Defaults to "base64".
 * @returns {string} The encoded string.
 */
export function encode(string, encoding = "base64") {
  if (typeof Buffer !== "undefined") return Buffer.from(string).toString(encoding);
  let result = "";
  switch (encoding) {
    case "base64":
      result = btoa(string);
      break;
    case "hex":
      for (let i = 0, len = string.length; i < len; i++) result += string[i].charCodeAt(0).toString(16).padStart(2, "0");
      break;
    case "ascii":
    case "binary":
    default:
      throw new Error("Not ready for this encoding");
  }
  return result;
}

/**
 * Decodes a string using a specified encoding.
 *
 * @param {string} data - The string to decode.
 * @param {"base64" | "hex" | "ascii" | "binary"} [encoding] - The encoding to use. Defaults to "base64".
 * @returns {string} The decoded string.
 */
export function decode(data, encoding = "base64") {
  if (typeof Buffer !== "undefined") return Buffer.from(data, encoding).toString();
  let result = "";
  switch (encoding) {
    case "base64":
      result = atob(data);
      break;
    case "hex":
      var hexes = data.match(/.{1,2}/g) || [];
      for (let i = 0, len = hexes.length; i < len; i++) {
        result += String.fromCharCode(parseInt(hexes[i], 16));
      }
      break;
    case "ascii":
    case "binary":
    default:
      throw new Error("Not ready for this encoding");
  }
  return result;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} string - The string to capitalize.
 * @returns {string} The capitalized string.
 */
export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Abbreviates a number or string.
 *
 * @param {string | number} input - The number or string to abbreviate.
 * @returns {string} The abbreviated string.
 */
export function abbreviate(input) {
  if (typeof input === "number") input = `${Math.ceil(input)}`;
  if (typeof input !== "string") return input;
  let target = input.replace(/\s+/g, "");
  if (target.includes(",") || target.replace(/[^.]/g, "").length > 1) {
    target = target.split(".").join("").split(",").join(".");
  }
  target = Math.ceil(Number(target));
  if (isNaN(target) || target < 1000) {
    return input;
  }
  const suffixes = ["", "K", "M", "B", "T"],
    suffixNum = Math.floor(("" + target).length / 3);
  let shortValue = "";
  for (let p = 2; p >= 1; p--) {
    shortValue = parseFloat((suffixNum != 0 ? target / Math.pow(1000, suffixNum) : target).toPrecision(p));
    if ((shortValue + "").replace(/[^a-zA-Z 0-9]+/g, "")?.length <= 2) {
      break;
    }
  }
  if (shortValue % 1 != 0) {
    shortValue = shortValue.toFixed(1);
  }
  return shortValue + suffixes[suffixNum];
}

/**
 * Checks if a string is a valid IP address.
 *
 * @param {string} string - The string to check.
 * @returns {boolean} Whether the string is a valid IP address.
 */
export function isIPAddress(string) {
  return new RegExp(
    "((^s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*$))",
  ).test(string);
}

/**
 * Checks if a string is a valid URL.
 *
 * @param {string} string - The string to check.
 * @returns {boolean} Whether the string is a valid URL.
 */
export function isValidUrl(string) {
  try {
    return !!new URL(string);
  } catch {
    return false;
  }
}

/**
 * Checks if a string is a valid URL pathname.
 *
 * @param {string} string - The string to check.
 * @returns {boolean} Whether the string is a valid URL pathname.
 */
export function isValidUrlPathname(string) {
  return !/[^A-Za-z0-9/\-._~!$&'()*+,;=:@/]/g.test(string);
}

/**
 * Ensures that a given string ends with a specified pattern.
 *
 * @param {string} str - The string to be checked.
 * @param {string} pattern - The pattern that the string should end with.
 * @returns {string} - The original string with the pattern appended if it wasn't already present.
 */
export function ensureEndsWith(str, pattern) {
  if (str.endsWith(pattern)) return str;
  for (let i = 0, len = pattern.length; i < len; i++) {
    if (str.endsWith(pattern.slice(0, len - i))) return str + pattern.slice(i);
  }
  return str + pattern;
}
