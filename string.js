const hasBuffer = typeof Buffer !== "undefined";

export const encode = (string, encoding = "base64") => {
  if (hasBuffer) return Buffer.from(string).toString(encoding);
  let result = "";
  switch (encoding) {
    case "base64":
      result = btoa(string);
      break;
    case "hex":
      for (let i = 0, len = string.length; i < len; i++) {
        result += ("000" + string.charCodeAt(i).toString(16)).slice(-4);
      }
      break;
    case "ascii":
    case "binary":
    default:
      throw new Error("Not ready for this encoding");
  }
  return result;
};

export const decode = (data, encoding = "base64") => {
  if (hasBuffer) return Buffer.from(data, encoding).toString();
  let result = "";
  switch (encoding) {
    case "base64":
      result = atob(data);
      break;
    case "hex":
      var hexes = data.match(/.{1,4}/g) || [];
      for (let i = 0, len = hexes; i < len; i++) {
        result += String.fromCharCode(parseInt(hexes[i], 16));
      }
      break;
    case "ascii":
    case "binary":
    default:
      throw new Error("Not ready for this encoding");
  }
  return result;
};

export const capitalize = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const abbreviate = (input) => {
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
    shortValue = parseFloat(
      (suffixNum != 0
        ? target / Math.pow(1000, suffixNum)
        : target
      ).toPrecision(p),
    );
    if ((shortValue + "").replace(/[^a-zA-Z 0-9]+/g, "")?.length <= 2) {
      break;
    }
  }
  if (shortValue % 1 != 0) {
    shortValue = shortValue.toFixed(1);
  }
  return shortValue + suffixes[suffixNum];
};

export const isIPAddress = (string) =>
  new RegExp(
    "((^s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*$))",
  ).test(string);

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

export const isValidUrlPathname = (string) =>
  !/[^A-Za-z0-9/\-._~!$&'()*+,;=:@/]/g.test(string);
