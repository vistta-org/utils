/**
 * @typedef {"TEXT" | "INTEGER" | "REAL" | "BLOB" | "BOOLEAN" | "OBJECT" | "DATE" | "NULL"} FieldType
 * @typedef {Record<string, FieldType>} Schema
 * @typedef {null | string | number | number[]} StoredValue
 * @typedef {Record<string, StoredValue> & {id: number}} Row
 * @typedef {{
 * initialize: (schema: Schema) => Promise<void>,
 * save: (action: "insert" | "update" | "upsert", values: Record<string, StoredValue>, id?: number) => Promise<number>,
 * delete: (id: number) => Promise<boolean>,
 * all: () => Promise<Row[]>,
 * close: () => Promise<void>
 * }} Storage
 */

/** @param {string} name @param {Schema} fields */
export function validateSchema(name, fields) {
  if (typeof name !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || name.toLowerCase().startsWith("__vistta_")) {
    throw new TypeError("Table names must be identifiers and must not start with __vistta_.");
  }
  if (!fields || typeof fields !== "object" || Object.getPrototypeOf(fields) !== Object.prototype) {
    throw new TypeError("Fields must be a plain schema object.");
  }
  const types = ["TEXT", "INTEGER", "REAL", "BLOB", "BOOLEAN", "OBJECT", "DATE", "NULL"];
  for (const [field, type] of Object.entries(fields)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(field) || field.toLowerCase() === "id") {
      throw new TypeError(`Invalid schema field: ${field}`);
    }
    if (!types.includes(type)) throw new TypeError(`Invalid field type: ${type}`);
  }
  const names = Object.keys(fields);
  if (new Set(names.map((field) => field.toLowerCase())).size !== names.length) {
    throw new TypeError("Schema fields must not differ only by case.");
  }
  return Object.freeze(Object.fromEntries(Object.entries(fields).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))));
}

/** @param {unknown} id @returns {asserts id is number} */
export function validateId(id) {
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 0) {
    throw new TypeError("IDs must be non-negative safe integers.");
  }
}

/** @param {unknown} value @param {Set<object>} [ancestors] */
function validateJSON(value, ancestors = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (!value || typeof value !== "object" || (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype)) {
    throw new TypeError("OBJECT fields must contain JSON-compatible values.");
  }
  if (ancestors.has(value)) throw new TypeError("OBJECT fields must not contain cycles.");
  if (Object.getOwnPropertySymbols(value).length) throw new TypeError("OBJECT fields must not contain symbol keys.");
  ancestors.add(value);
  for (const child of Array.isArray(value) ? value : Object.values(value)) validateJSON(child, ancestors);
  ancestors.delete(value);
}

/** @param {FieldType | "ID"} type @param {unknown} value @returns {StoredValue} */
function encode(type, value) {
  if (type === "ID") {
    validateId(value);
    return value;
  }
  if (value === null) return null;
  if (type === "TEXT" && typeof value === "string") return value;
  if (type === "INTEGER" && typeof value === "number" && Number.isSafeInteger(value)) return value;
  if (type === "REAL" && typeof value === "number" && Number.isFinite(value)) return value;
  if (type === "BOOLEAN" && typeof value === "boolean") return value ? 1 : 0;
  if (type === "DATE" && value instanceof Date && Number.isFinite(value.getTime())) return value.getTime();
  if (type === "BLOB" && value instanceof Uint8Array) return Array.from(value);
  if (type === "OBJECT" && value && typeof value === "object") {
    validateJSON(value);
    return JSON.stringify(value);
  }
  throw new TypeError(`Invalid value for ${type} field.`);
}

/** @param {Schema} schema @param {string} field */
function fieldType(schema, field) {
  if (field === "id") return "ID";
  if (!Object.hasOwn(schema, field)) throw new TypeError(`Invalid field: ${field}`);
  return schema[field];
}

/** @param {Schema} schema @param {Row} row @param {string[]} fields */
function decode(schema, row, fields) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = row[field];
      const type = fieldType(schema, field);
      if (value === null || type === "ID") return [field, value];
      if (type === "BOOLEAN") return [field, value === 1];
      if (type === "DATE" && typeof value === "number") return [field, new Date(value)];
      if (type === "OBJECT" && typeof value === "string") return [field, JSON.parse(value)];
      if (type === "BLOB" && Array.isArray(value)) return [field, new Uint8Array(value)];
      return [field, value];
    }),
  );
}

/** @param {StoredValue} a @param {StoredValue} b */
function compare(a, b) {
  if (a === b) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  return a < b ? -1 : 1;
}

export class Database {
  /** @type {Schema} */
  #schema;
  /** @type {Storage} */
  #storage;
  /** @type {Promise<void> | undefined} */
  #ready;
  #closed = false;

  /** @param {Schema} schema @param {Storage} storage */
  constructor(schema, storage) {
    this.#schema = schema;
    this.#storage = storage;
  }

  async #initialize() {
    if (this.#closed) throw new Error("Database is closed.");
    this.#ready ??= this.#storage.initialize(this.#schema);
    await this.#ready;
    if (this.#closed) throw new Error("Database is closed.");
  }

  /** @param {Record<string, unknown>} fields @param {boolean} partial */
  #values(fields, partial) {
    if (!fields || typeof fields !== "object" || Object.getPrototypeOf(fields) !== Object.prototype) {
      throw new TypeError("Fields must be a plain object.");
    }
    const values = Object.fromEntries(
      Object.entries(fields)
        .filter(([field]) => field !== "id")
        .map(([field, value]) => [field, encode(fieldType(this.#schema, field), value)]),
    );
    if (!partial) {
      for (const field of Object.keys(this.#schema)) {
        if (!Object.hasOwn(values, field)) values[field] = null;
      }
    }
    return values;
  }

  /** @param {Record<string, unknown>} fields @returns {Promise<number>} */
  async insert(fields) {
    if (fields && Object.hasOwn(fields, "id")) throw new TypeError("Use upsert to insert an explicit ID.");
    const values = this.#values(fields, false);
    await this.#initialize();
    return this.#storage.save("insert", values);
  }

  /** @param {Record<string, unknown> & {id: number}} fields @returns {Promise<number>} */
  async update(fields) {
    const id = fields?.id;
    validateId(id);
    const values = this.#values(fields, true);
    await this.#initialize();
    return this.#storage.save("update", values, id);
  }

  /** @param {Record<string, unknown>} fields @returns {Promise<number>} */
  async upsert(fields) {
    if (!fields || typeof fields !== "object") throw new TypeError("Fields must be an object.");
    if (!Object.hasOwn(fields, "id")) return this.insert(fields);
    const id = fields.id;
    validateId(id);
    const values = this.#values(fields, true);
    await this.#initialize();
    return this.#storage.save("upsert", values, id);
  }

  /** @param {number} id @returns {Promise<boolean>} */
  async delete(id) {
    validateId(id);
    await this.#initialize();
    return this.#storage.delete(id);
  }

  /** @param {string | string[]} [fields] */
  select(fields = "*") {
    const schema = this.#schema;
    const selected = typeof fields === "string" ? [fields] : fields;
    if (!Array.isArray(selected) || !selected.length) throw new TypeError("Select at least one field.");
    const projection = selected.length === 1 && selected[0] === "*" ? ["id", ...Object.keys(this.#schema)] : [...selected];
    for (const field of projection) fieldType(this.#schema, field);
    /** @type {{field: string, operator: string, value: StoredValue}[]} */
    const filters = [];
    /** @type {{field: string, direction: "asc" | "desc"}[]} */
    const order = [];
    /** @type {number | undefined} */
    let count;
    const addFilter = (field, operator, value) => {
      const type = fieldType(this.#schema, field);
      if (type === "OBJECT" || type === "BLOB") throw new TypeError("OBJECT and BLOB fields cannot be filtered or ordered.");
      if (!["=", "!=", "<", "<=", ">", ">="].includes(operator)) throw new TypeError(`Invalid operator: ${operator}`);
      if (value === null && operator !== "=" && operator !== "!=") throw new TypeError("Null supports only = and !=.");
      filters.push({ field, operator, value: encode(type, value) });
    };
    const all = async () => {
      const conditions = [...filters];
      const ordering = [...order];
      const maximum = count;
      await this.#initialize();
      let rows = (await this.#storage.all()).filter((row) =>
        conditions.every(({ field, operator, value }) => {
          const current = row[field];
          if (operator === "=") return current === value;
          if (operator === "!=") return current !== value;
          if (current === null) return false;
          const result = compare(current, value);
          if (operator === "<") return result < 0;
          if (operator === "<=") return result <= 0;
          if (operator === ">") return result > 0;
          return result >= 0;
        }),
      );
      rows.sort((a, b) => {
        for (const { field, direction } of ordering) {
          const result = compare(a[field], b[field]);
          if (result) return direction === "asc" ? result : -result;
        }
        return a.id - b.id;
      });
      if (maximum !== undefined) rows = rows.slice(0, maximum);
      return rows.map((row) => decode(this.#schema, row, projection));
    };
    return {
      /** @param {string | Record<string, unknown>} field @param {string} [operator] @param {unknown} [value] */
      where(field, operator, value) {
        if (field && typeof field === "object" && !Array.isArray(field)) {
          if (operator !== undefined || value !== undefined) throw new TypeError("Object filters take a single argument.");
          for (const [key, item] of Object.entries(field)) addFilter(key, "=", item);
        } else if (typeof field === "string") addFilter(field, operator, value);
        else throw new TypeError("Use where({field: value}) or where(field, operator, value).");
        return this;
      },
      /** @param {string} field @param {"asc" | "desc"} [direction] */
      orderBy(field, direction = "asc") {
        const type = fieldType(schema, field);
        if (type === "OBJECT" || type === "BLOB")
          throw new TypeError("OBJECT and BLOB fields cannot be filtered or ordered.");
        if (direction !== "asc" && direction !== "desc") throw new TypeError("Order direction must be asc or desc.");
        order.push({ field, direction });
        return this;
      },
      /** @param {number} value */
      limit(value) {
        if (!Number.isSafeInteger(value) || value < 0) throw new TypeError("Limit must be a non-negative safe integer.");
        if (count !== undefined) throw new Error("LIMIT clause already defined.");
        count = value;
        return this;
      },
      all,
      get: async () => (await all())[0],
    };
  }

  async close() {
    this.#closed = true;
    try {
      await this.#ready;
    } finally {
      await this.#storage.close();
    }
  }
}
