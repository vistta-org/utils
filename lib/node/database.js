import { DatabaseSync } from "node:sqlite";
import { Database as SharedDatabase, validateId, validateSchema } from "../database.js";

/** @typedef {import("../database.js").Schema} Schema */
/** @typedef {import("../database.js").StoredValue} StoredValue */
/** @typedef {import("../database.js").Row} Row */

/** @param {string} name */
const quote = (name) => `"${name.replaceAll('"', '""')}"`;

class SQLiteStorage {
  /** @type {DatabaseSync | undefined} */
  #db;
  /** @type {Schema} */
  #schema;
  #file;
  #name;

  /** @param {string} file @param {string} name */
  constructor(file, name) {
    this.#file = file;
    this.#name = name;
  }

  /** @param {Schema} schema */
  async initialize(schema) {
    const db = new DatabaseSync(this.#file);
    try {
      db.exec("PRAGMA busy_timeout = 5000");
      db.exec("BEGIN IMMEDIATE");
      try {
        db.exec(
          "CREATE TABLE IF NOT EXISTS __vistta_database_schema (name TEXT PRIMARY KEY, schema TEXT NOT NULL, nextId INTEGER NOT NULL) STRICT",
        );
        const existing = db.prepare("SELECT schema FROM __vistta_database_schema WHERE name = ?").get(this.#name);
        const definition = JSON.stringify(schema);
        if (existing && existing.schema !== definition) throw new Error(`Schema mismatch for table ${this.#name}.`);
        if (!existing) {
          const table = db
            .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? COLLATE NOCASE")
            .get(this.#name);
          if (table) throw new Error(`Table ${this.#name} already exists outside the shared database API.`);
          const types = {
            TEXT: "TEXT",
            INTEGER: "INTEGER",
            REAL: "REAL",
            BLOB: "BLOB",
            BOOLEAN: "INTEGER",
            OBJECT: "TEXT",
            DATE: "INTEGER",
            NULL: "TEXT",
          };
          const columns = Object.entries(schema).map(([field, type]) => `${quote(field)} ${types[type]}`);
          db.exec(
            `CREATE TABLE ${quote(this.#name)} (id INTEGER PRIMARY KEY${columns.length ? ", " + columns.join(", ") : ""}) STRICT`,
          );
          db.prepare("INSERT INTO __vistta_database_schema VALUES (?, ?, 1)").run(this.#name, definition);
        }
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } catch (error) {
      db.close();
      throw error;
    }
    this.#schema = schema;
    this.#db = db;
  }

  #connection() {
    if (!this.#db) throw new Error("Database is not open.");
    return this.#db;
  }

  /** @param {"insert" | "update" | "upsert"} action @param {Record<string, StoredValue>} values @param {number} [id] */
  async save(action, values, id) {
    const db = this.#connection();
    db.exec("BEGIN IMMEDIATE");
    try {
      const metadata = db.prepare("SELECT nextId FROM __vistta_database_schema WHERE name = ?").get(this.#name);
      if (!metadata || typeof metadata.nextId !== "number") throw new Error("Invalid database ID sequence.");
      const key = id ?? metadata.nextId;
      validateId(key);
      const existing = id === undefined ? undefined : db.prepare(`SELECT id FROM ${quote(this.#name)} WHERE id = ?`).get(id);
      if (action === "update" && !existing) throw new Error(`Record ${key} does not exist.`);
      const fields = Object.keys(values);
      const parameters = fields.map((field) => {
        const value = values[field];
        return Array.isArray(value) ? new Uint8Array(value) : value;
      });
      if (existing) {
        if (fields.length) {
          db.prepare(
            `UPDATE ${quote(this.#name)} SET ${fields.map((field) => `${quote(field)} = ?`).join(", ")} WHERE id = ?`,
          ).run(...parameters, key);
        }
      } else {
        db.prepare(
          `INSERT INTO ${quote(this.#name)} (${["id", ...fields].map(quote).join(", ")}) VALUES (${["?", ...fields.map(() => "?")].join(", ")})`,
        ).run(key, ...parameters);
        if (key >= metadata.nextId) {
          if (key === Number.MAX_SAFE_INTEGER) throw new RangeError("Database ID sequence exhausted.");
          db.prepare("UPDATE __vistta_database_schema SET nextId = ? WHERE name = ?").run(key + 1, this.#name);
        }
      }
      db.exec("COMMIT");
      return key;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  /** @param {number} id */
  async delete(id) {
    return (
      this.#connection()
        .prepare(`DELETE FROM ${quote(this.#name)} WHERE id = ?`)
        .run(id).changes !== 0
    );
  }

  /** @returns {Promise<Row[]>} */
  async all() {
    return this.#connection()
      .prepare(`SELECT * FROM ${quote(this.#name)}`)
      .all()
      .map((record) => {
        if (typeof record.id !== "number") throw new Error("Invalid stored record ID.");
        /** @type {Row} */
        const row = { id: record.id };
        for (const field of Object.keys(this.#schema)) {
          const value = record[field];
          if (value instanceof Uint8Array) row[field] = Array.from(value);
          else if (typeof value === "string" || typeof value === "number") row[field] = value;
          else if (value === null) row[field] = null;
          else throw new Error(`Invalid stored value for ${field}.`);
        }
        return row;
      });
  }

  async close() {
    this.#db?.close();
    this.#db = undefined;
  }
}

export class Database extends SharedDatabase {
  /** @param {string} file @param {string} name @param {Schema} fields */
  constructor(file, name, fields) {
    const schema = validateSchema(name, fields);
    if (typeof file !== "string" || !file || file.includes("\0"))
      throw new TypeError("Database file must be a non-empty string.");
    super(schema, new SQLiteStorage(file, name.toLowerCase()));
  }
}

export default Database;
