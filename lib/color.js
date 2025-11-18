/**
 * Convert a color string to a specified format.
 * @param {string} color Input color string
 * @param {"hex" | "rgb" | "rgba" | "hsl" | "hsla"} format Output format: "hex", "rgb", "rgba", "hsl", "hsla"
 * @returns {string} Converted color string
 */
export function formatColor(color, format) {
  return toColor(parseColor(color), format);
}

/**
 * Mix two colors by a given ratio.
 * @param {string} aStr First color string
 * @param {string} bStr Second color string
 * @param {"hex" | "rgb" | "rgba" | "hsl" | "hsla"} [format="hex"] Output format: "hex", "rgb", "rgba", "hsl", "hsla"
 * @param {number|string} [t=0.5] Mix ratio (0 to 1 or percentage string)
 * @returns {string} Mixed color string
 */
export function mixColors(aStr, bStr, format = "hex", t = 0.5) {
  const tnum = parseRatio(t);
  const a = parseColor(aStr);
  const b = parseColor(bStr);

  let out = { r: 0, g: 0, b: 0, a: clamp01(a.a * (1 - tnum) + b.a * tnum) };
  if (out.a > 1e-12) {
    out.r = linearToSrgb((srgbToLinear(a.r) * a.a * (1 - tnum) + srgbToLinear(b.r) * b.a * tnum) / out.a);
    out.g = linearToSrgb((srgbToLinear(a.g) * a.a * (1 - tnum) + srgbToLinear(b.g) * b.a * tnum) / out.a);
    out.b = linearToSrgb((srgbToLinear(a.b) * a.a * (1 - tnum) + srgbToLinear(b.b) * b.a * tnum) / out.a);
  } else out.r = out.g = out.b = 0;
  return toColor(out, format);
}

/**
 * Get a contrasting color (black or white) for the given color.
 * @param {string} color Input color string
 * @param {"hex" | "rgb" | "rgba" | "hsl" | "hsla"} [format="hex"] Output format: "hex", "rgb", "rgba", "hsl", "hsla"
 * @returns {string} Contrasting color string
 */
export function contrastColor(color, format = "hex") {
  const c = parseColor(color);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b > 0.5
    ? toColor({ r: 0, g: 0, b: 0, a: 1 }, format)
    : toColor({ r: 1, g: 1, b: 1, a: 1 }, format);
}

function parseColor(input) {
  if (typeof input !== "string") throw new TypeError("color must be a string");
  const s = input.trim().toLowerCase();

  // Hex forms: #rgb #rgba #rrggbb #rrggbbaa
  if (s[0] === "#") {
    const hex = s.slice(1);
    let r,
      g,
      b,
      a = 255;
    if (hex.length === 3 || hex.length === 4) {
      // expand each nibble
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16);
    } else {
      throw new Error("Invalid hex color length: " + input);
    }
    return { r: r / 255, g: g / 255, b: b / 255, a: a / 255 };
  }

  // rgb() / rgba() - allow numbers or percentages, allow separators , or spaces
  const funcMatch = s.match(/^(rgba?|rgb)\(\s*([^)]+)\s*\)$/);
  if (funcMatch) {
    const parts = funcMatch[2]
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 1) {
      // space separated form like "rgb(10 20 30 / .5)" → split by whitespace
      const spaceParts = funcMatch[2].split(/\s+/).filter(Boolean);
      // handle optional slash for alpha
      const slashIdx = spaceParts.indexOf("/");
      if (slashIdx >= 0) {
        const alphaTok = spaceParts
          .slice(slashIdx + 1)
          .join("")
          .trim();
        const rgbToks = spaceParts.slice(0, slashIdx);
        if (rgbToks.length !== 3) throw new Error("Invalid rgb shape: " + input);
        const r = parsePercentOrNumber(rgbToks[0], 255);
        const g = parsePercentOrNumber(rgbToks[1], 255);
        const b = parsePercentOrNumber(rgbToks[2], 255);
        const a = alphaTok.endsWith("%") ? clamp01(parseFloat(alphaTok) / 100) : clamp01(parseFloat(alphaTok));
        return { r: r / 255, g: g / 255, b: b / 255, a };
      }
      // fallthrough: treat as comma-less rgb with spaces
      const r = parsePercentOrNumber(spaceParts[0] || "0", 255);
      const g = parsePercentOrNumber(spaceParts[1] || "0", 255);
      const b = parsePercentOrNumber(spaceParts[2] || "0", 255);
      const a = spaceParts[3] ? parsePercentOrNumber(spaceParts[3], 1) : 1;
      return { r: r / 255, g: g / 255, b: b / 255, a: a > 1 ? a / 255 : a };
    }
    // common comma-separated case
    if (parts.length < 3) throw new Error("Invalid rgb/rgba color: " + input);
    const r = parsePercentOrNumber(parts[0], 255);
    const g = parsePercentOrNumber(parts[1], 255);
    // last part may contain "/ alpha" if using modern syntax
    let bTok = parts[2];
    let a = 1;
    if (bTok.includes("/")) {
      const [bPart, aPart] = bTok.split("/").map((x) => x.trim());
      bTok = bPart;
      a = aPart.endsWith("%") ? clamp01(parseFloat(aPart) / 100) : clamp01(parseFloat(aPart));
    } else if (parts[3]) {
      a = parts[3].endsWith("%") ? clamp01(parseFloat(parts[3]) / 100) : clamp01(parseFloat(parts[3]));
    }
    const b = parsePercentOrNumber(bTok, 255);
    return { r: r / 255, g: g / 255, b: b / 255, a };
  }

  // hsl()/hsla() - accept both comma and space forms, S and L may be percentages
  const hslMatch = s.match(/^(hsla?|hsl)\(\s*([^)]+)\s*\)$/);
  if (hslMatch) {
    const parts = hslMatch[2]
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 1) {
      // space-separated form: "hsl(120 50% 50% / .5)"
      const spaceParts = hslMatch[2].split(/\s+/).filter(Boolean);
      const slashIdx = spaceParts.indexOf("/");
      if (slashIdx >= 0) {
        const alphaTok = spaceParts
          .slice(slashIdx + 1)
          .join("")
          .trim();
        const hsltoks = spaceParts.slice(0, slashIdx);
        if (hsltoks.length !== 3) throw new Error("Invalid hsl shape: " + input);
        const h = parseFloat(hsltoks[0]);
        const sVal = hsltoks[1].endsWith("%") ? parseFloat(hsltoks[1]) / 100 : parseFloat(hsltoks[1]);
        const lVal = hsltoks[2].endsWith("%") ? parseFloat(hsltoks[2]) / 100 : parseFloat(hsltoks[2]);
        const a = alphaTok.endsWith("%") ? clamp01(parseFloat(alphaTok) / 100) : clamp01(parseFloat(alphaTok));
        const rgb = hslToRgb(h, clamp01(sVal), clamp01(lVal));
        return { r: rgb.r, g: rgb.g, b: rgb.b, a };
      }
      // space-separated without slash (rare but handle)
      const h = parseFloat(spaceParts[0]);
      const sVal = spaceParts[1].endsWith("%") ? parseFloat(spaceParts[1]) / 100 : parseFloat(spaceParts[1]);
      const lVal = spaceParts[2].endsWith("%") ? parseFloat(spaceParts[2]) / 100 : parseFloat(spaceParts[2]); // fallback handled below
      // (above line has guard, but if invalid tokens existing parseFloat will return NaN; clamp01 handles)
      const rgb = hslToRgb(h, clamp01(isNaN(sVal) ? 0 : sVal), clamp01(isNaN(lVal) ? 0 : lVal));
      return { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 };
    }
    // comma-separated case: ["h", " s%", " l%"] optionally ["h"," s%"," l%"," a"]
    if (parts.length < 3) throw new Error("Invalid hsl/hsla color: " + input);
    const h = parseFloat(parts[0]);
    const sVal = parts[1].endsWith("%") ? parseFloat(parts[1]) / 100 : parseFloat(parts[1]);
    const lVal = parts[2].endsWith("%") ? parseFloat(parts[2]) / 100 : parseFloat(parts[2]);
    let a = 1;
    if (parts[2].includes("/")) {
      // "h, s%, l%/a" style inside parts[2]
      const [lPart, aPart] = parts[2].split("/").map((x) => x.trim());
      const lVal2 = lPart.endsWith("%") ? parseFloat(lPart) / 100 : parseFloat(lPart);
      a = aPart.endsWith("%") ? clamp01(parseFloat(aPart) / 100) : clamp01(parseFloat(aPart));
      const rgb = hslToRgb(h, clamp01(isNaN(sVal) ? 0 : sVal), clamp01(isNaN(lVal2) ? 0 : lVal2));
      return { r: rgb.r, g: rgb.g, b: rgb.b, a };
    } else if (parts[3]) {
      a = parts[3].endsWith("%") ? clamp01(parseFloat(parts[3]) / 100) : clamp01(parseFloat(parts[3]));
    }
    const rgb = hslToRgb(h, clamp01(isNaN(sVal) ? 0 : sVal), clamp01(isNaN(lVal) ? 0 : lVal));
    return { r: rgb.r, g: rgb.g, b: rgb.b, a };
  }

  throw new Error("Unsupported color format: " + input);
}

function toColor(c, format) {
  switch (format) {
    case "hex": {
      let result = "#";
      result += toHexByte(c.r);
      result += toHexByte(c.g);
      result += toHexByte(c.b);
      if (c.a < 0.999) result += toHexByte(c.a);
      return result.toUpperCase();
    }
    case "rgb":
      return `rgb(${Math.round(clamp01(c.r) * 255)}, ${Math.round(clamp01(c.g) * 255)}, ${Math.round(clamp01(c.b) * 255)})`;
    case "rgba":
      return `rgba(${Math.round(clamp01(c.r) * 255)}, ${Math.round(clamp01(c.g) * 255)}, ${Math.round(clamp01(c.b) * 255)}, ${Math.round(clamp01(c.a) * 100) / 100})`;
    case "hsl": {
      const { h, s, l } = rgbToHsl(clamp01(c.r), clamp01(c.g), clamp01(c.b));
      return `hsl(${Math.round(h)}, ${Math.round(clamp01(s) * 100)}%, ${Math.round(clamp01(l) * 100)}%)`;
    }
    case "hsla": {
      const { h, s, l } = rgbToHsl(clamp01(c.r), clamp01(c.g), clamp01(c.b));
      return `hsla(${Math.round(h)}, ${Math.round(clamp01(s) * 100)}%, ${Math.round(clamp01(l) * 100)}%, ${Math.round(clamp01(c.a) * 100) / 100})`;
    }
    default:
      throw new Error("Unsupported output color format: " + format);
  }
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function hslToRgb(h, s, l) {
  if (s === 0) return { r: l, g: l, b: l };
  const hk = (((h % 360) + 360) % 360) / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const convert = (t) => {
    let ct = t;
    if (ct < 0) ct += 1;
    if (ct > 1) ct -= 1;
    if (ct < 1 / 6) return p + (q - p) * 6 * ct;
    if (ct < 1 / 2) return q;
    if (ct < 2 / 3) return p + (q - p) * (2 / 3 - ct) * 6;
    return p;
  };
  return { r: convert(hk + 1 / 3), g: convert(hk), b: convert(hk - 1 / 3) };
}

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0;
  const l = (max + min) / 2;
  let s = 0;
  if (diff !== 0) {
    s = diff / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / diff) % 6;
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h = h * 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

function toHexByte(v) {
  return Math.round(clamp01(v) * 255)
    .toString(16)
    .padStart(2, "0");
}

function parsePercentOrNumber(tok, scale = 255) {
  if (!tok.endsWith("%")) return clamp01(parseFloat(tok) / (isFinite(parseFloat(tok)) ? 1 : scale)) * scale;
  const p = parseFloat(tok) / 100;
  return clamp01(isFinite(p) ? p : 0) * scale;
}

function parseRatio(t) {
  if (typeof t === "string" && t.trim().endsWith("%")) {
    const p = parseFloat(t) / 100;
    if (!isFinite(p)) throw new Error("Invalid percentage: " + t);
    return clamp01(p);
  }
  const n = Number(t);
  return clamp01(isFinite(n) ? n : 0);
}
