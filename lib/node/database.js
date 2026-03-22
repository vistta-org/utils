import { DatabaseSync } from "node:sqlite";

const files = {};
/**
 * @typedef {"TEXT"|"INTEGER"|"REAL"|"BLOB"|"BOOLEAN"|"OBJECT"|"DATE"|"NULL"} SqlValueType
 */

/**
 * @template T
 */
class Database {
  #instance;
  #name;
  #fields;
  #transform;

  /**
   * @param {string} name
   * @param {Record<string, SqlValueType>} fields
   */
  constructor(file, name, fields) {
    if (!files[file]) files[file] = new DatabaseSync(file);
    this.#instance = files[file];
    this.#name = name;
    this.#fields = fields;
    const fieldKeys = Object.keys(fields);
    let columns = "id INTEGER PRIMARY KEY";
    for (let i = 0, len = fieldKeys.length; i < len; i++)
      columns += `, ${fieldKeys[i]} ${transformCustomSQLiteType(fields[fieldKeys[i]])}`;
    this.#instance.exec(`CREATE TABLE IF NOT EXISTS ${name}(${columns}) STRICT`);
    this.#transform = createRecordTransformer(fields);
  }

  /**
   * @param {Partial<Omit<T, "id">>} fields
   * @return {number} The ID of the inserted record
   */
  insert(fields) {
    const fieldKeys = Object.keys(fields);
    let fieldNames = "id";
    let fieldValues = "?";
    const values = [];
    for (let i = 0, len = fieldKeys.length; i < len; i++) {
      if (!this.#fields[fieldKeys[i]]) throw new Error(`Invalid Field: ${fieldKeys[i]}`);
      fieldNames += `, ${fieldKeys[i]}`;
      fieldValues += ", ?";
      values.push(transformCustomSQLiteTypeValue(this.#fields[fieldKeys[i]], fields[fieldKeys[i]]));
    }
    let id = this.#instance.prepare(`SELECT MAX(id) as maxId FROM ${this.#name}`)?.get()?.maxId;
    if (id == null) id = 0;
    else id++;
    this.#instance.prepare(`INSERT INTO ${this.#name} (${fieldNames}) VALUES (${fieldValues})`).run(id, ...values);
    return id;
  }

  /**
   * @param {Partial<Omit<T, "id">> & { id?: number }} fields
   * @return {number} The ID of the inserted record
   */
  upsert(fields) {
    if (!fields.id || this.select("id").where(`id = ${fields.id}`).get()) return this.insert(fields);
    return this.update(/** @type {any} */ (fields));
  }

  /**
   * @param {Partial<Omit<T, "id">> & { id: number }} fields
   * @return {number} The ID of the inserted record
   * @throws {Error} If the fields object does not contain an id
   */
  update(fields) {
    const fieldKeys = Object.keys(fields);
    let set = "";
    const values = [];
    for (let i = 0, len = fieldKeys.length; i < len; i++) {
      if (fieldKeys[i] === "id") continue;
      if (!this.#fields[fieldKeys[i]]) throw new Error(`Invalid Field: ${fieldKeys[i]}`);
      set += `${fieldKeys[i]} = ?, `;
      values.push(transformCustomSQLiteTypeValue(this.#fields[fieldKeys[i]], fields[fieldKeys[i]]));
    }
    return this.#instance.prepare(`UPDATE ${this.#name} SET ${set.slice(0, -2)} WHERE id = ?`).run(...values, fields.id);
  }

  /**
   * @param {number} id
   * @return {void}
   */
  delete(id) {
    return this.#instance.prepare(`DELETE FROM ${this.#name} WHERE id = ?`).run(id);
  }

  /**
   * @param {(Extract<keyof T, string> | "id" | "*") | (Extract<keyof T, string> | "id")[]} fields
   * @return {Object} An object with methods to build a query
   */
  select(fields) {
    const selectedFields = Array.isArray(fields) ? fields : [fields];
    let fieldKeys = "";
    if (selectedFields.length === 1 && selectedFields[0] === "*") fieldKeys = "*";
    else
      for (let i = 0, len = selectedFields.length; i < len; i++) {
        const field = selectedFields[i];
        if (!this.#fields[field] && field !== "id") throw new Error(`Invalid Field: ${field}`);
        fieldKeys += field + (i === len - 1 ? "" : ", ");
      }
    const options = {};
    return {
      /**
       * @param {string} query
       * @throws {Error} If the WHERE clause is already defined
       */
      where(query) {
        if (options["WHERE"]) throw new Error("WHERE clause already defined");
        options["WHERE"] = query;
        return this;
      },
      /**
       * @param {number} count
       * @throws {Error} If the LIMIT clause is already defined
       */
      limit(count) {
        if (options["LIMIT"]) throw new Error("LIMIT clause already defined");
        options["LIMIT"] = "" + count;
        return this;
      },
      /**
       * @param {string} order
       * @throws {Error} If the ORDER BY clause is already defined
       */
      orderBy(order) {
        if (options["ORDER BY"]) throw new Error("ORDER BY clause already defined");
        options["ORDER BY"] = order;
        return this;
      },
      all: (...args) => this.#transform(this.#instance.prepare(buildQuery(this.#name, fieldKeys, options)).all(...args)),
      get: (...args) => this.#transform(this.#instance.prepare(buildQuery(this.#name, fieldKeys, options)).get(...args)),
    };
  }
}

export { Database };
export default Database;

function buildQuery(table, fields, options) {
  let query = `SELECT ${fields} FROM ${table}`;
  const keys = Object.keys(options);
  for (let i = 0, len = keys.length; i < len; i++) query += ` ${keys[i]} ${options[keys[i]]}`;
  return query;
}

function transformCustomSQLiteType(type) {
  if (type === "BOOLEAN") return "INTEGER";
  if (type === "DATE") return "TEXT";
  if (type === "OBJECT") return "BLOB";
  return type;
}

function transformCustomSQLiteTypeValue(type, value) {
  if (value == null) return "";
  if (type === "BOOLEAN") return value ? 1 : 0;
  if (type === "DATE") return value.toISOString();
  if (type === "OBJECT") return Buffer.from(JSON.stringify(value));
  return value;
}

function createRecordTransformer(fields) {
  const fieldKeys = Object.keys(fields);
  const transformers = [];
  for (let i = 0, len = fieldKeys.length; i < len; i++) {
    const field = fieldKeys[i];
    if (fields[field] === "BOOLEAN") transformers.push({ field, transform: (value) => value === 1 });
    if (fields[field] === "DATE") transformers.push({ field, transform: (value) => new Date(value) });
    if (fields[field] === "OBJECT")
      transformers.push({
        field,
        transform: (value) => JSON.parse(Buffer.from(value).toString()),
      });
  }
  const transform = (arg) => {
    if (Array.isArray(arg)) {
      const result = [];
      for (let i = 0, len = arg.length; i < len; i++) result.push(transform(arg[i]));
      return result;
    }
    for (let i = 0, len = transformers.length; i < len; i++) {
      if (arg?.[transformers[i].field] == null) continue;
      arg[transformers[i].field] = transformers[i].transform(arg[transformers[i].field]);
    }
    return arg;
  };
  return transform;
}
