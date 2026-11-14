import { Database as SharedDatabase, validateId, validateSchema } from "../database.js";

/** @typedef {import("../database.js").Schema} Schema */
/** @typedef {import("../database.js").StoredValue} StoredValue */
/** @typedef {import("../database.js").Row} Row */

/**
 * @template T
 * @param {IDBRequest<T>} request
 * @param {(result: T) => void} callback
 * @param {(error: Error) => void} fail
 */
function onSuccess(request, callback, fail) {
  request.onsuccess = () => {
    try {
      callback(request.result);
    } catch (error) {
      fail(error instanceof Error ? error : new Error(String(error)));
    }
  };
}

class IndexedDBStorage {
  /** @type {IDBDatabase | undefined} */
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
    if (!globalThis.indexedDB) throw new Error("IndexedDB is not available in this environment.");
    this.#db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("@vistta/utils/database:" + this.#file, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("tables", { keyPath: "name" });
        request.result.createObjectStore("records", { keyPath: ["table", "id"] });
      };
      let blocked = false;
      request.onblocked = () => {
        blocked = true;
        reject(new Error("Unable to open database: upgrade is blocked."));
      };
      request.onerror = () => reject(request.error || new Error("Unable to open database."));
      request.onsuccess = () => {
        if (blocked) {
          request.result.close();
          return;
        }
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      };
    });
    this.#schema = schema;
    try {
      await this.#transaction("readwrite", (tables, records, complete, fail) => {
        const request = tables.get(this.#name);
        onSuccess(
          request,
          (existing) => {
            const definition = JSON.stringify(schema);
            if (existing && existing.schema !== definition) {
              fail(new Error(`Schema mismatch for table ${this.#name}.`));
              return;
            }
            if (!existing) tables.add({ name: this.#name, schema: definition, nextId: 1 });
            complete(undefined);
          },
          fail,
        );
      });
    } catch (error) {
      await this.close();
      throw error;
    }
  }

  /**
   * @template T
   * @param {IDBTransactionMode} mode
   * @param {(tables: IDBObjectStore, records: IDBObjectStore, complete: (value: T) => void, fail: (error: Error) => void) => void} execute
   * @returns {Promise<T>}
   */
  #transaction(mode, execute) {
    const db = this.#db;
    if (!db) return Promise.reject(new Error("Database is not open."));
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["tables", "records"], mode);
      /** @type {T} */
      let result;
      /** @type {Error | undefined} */
      let failure;
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(failure || tx.error || new Error("Database transaction aborted."));
      tx.onerror = () => {
        failure ??= tx.error || new Error("Database transaction failed.");
      };
      const fail = (error) => {
        failure = error;
        tx.abort();
      };
      try {
        execute(
          tx.objectStore("tables"),
          tx.objectStore("records"),
          (value) => {
            result = value;
          },
          fail,
        );
      } catch (error) {
        fail(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /** @param {"insert" | "update" | "upsert"} action @param {Record<string, StoredValue>} values @param {number} [id] */
  async save(action, values, id) {
    return this.#transaction("readwrite", (tables, records, complete, fail) => {
      const metadata = tables.get(this.#name);
      onSuccess(
        metadata,
        (table) => {
          if (!table || !Number.isSafeInteger(table.nextId)) {
            fail(new Error("Invalid database ID sequence."));
            return;
          }
          const key = id ?? table.nextId;
          validateId(key);
          const request = records.get([this.#name, key]);
          onSuccess(
            request,
            (existing) => {
              if (action === "update" && !existing) {
                fail(new Error(`Record ${key} does not exist.`));
                return;
              }
              const defaults = Object.fromEntries(Object.keys(this.#schema).map((field) => [field, null]));
              const data = { ...(existing ? existing.data : defaults), ...values, id: key };
              records.put({ table: this.#name, id: key, data });
              if (!existing && key >= table.nextId) {
                if (key === Number.MAX_SAFE_INTEGER) {
                  fail(new RangeError("Database ID sequence exhausted."));
                  return;
                }
                tables.put({ ...table, nextId: key + 1 });
              }
              complete(key);
            },
            fail,
          );
        },
        fail,
      );
    });
  }

  /** @param {number} id */
  async delete(id) {
    return this.#transaction("readwrite", (tables, records, complete, fail) => {
      const request = records.get([this.#name, id]);
      onSuccess(
        request,
        (record) => {
          const exists = record !== undefined;
          if (exists) records.delete([this.#name, id]);
          complete(exists);
        },
        fail,
      );
    });
  }

  /** @returns {Promise<Row[]>} */
  async all() {
    return this.#transaction("readonly", (tables, records, complete, fail) => {
      const request = records.getAll(IDBKeyRange.bound([this.#name, 0], [this.#name, Number.MAX_SAFE_INTEGER]));
      onSuccess(request, (result) => complete(result.map((record) => record.data)), fail);
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
      throw new TypeError("Database name must be a non-empty string.");
    super(schema, new IndexedDBStorage(file, name.toLowerCase()));
  }
}

export default Database;
