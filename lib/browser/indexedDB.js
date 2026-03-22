class IndexedDB {
  /** @type {Promise<IDBDatabase>} */
  #db;
  /** @type {string} */
  #store;

  /**
   * @param {string} dbName
   * @param {string} storeName
   */
  constructor(dbName, storeName) {
    this.#db = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB is not available in this environment"));
        return;
      }
      const request = indexedDB.open(dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName);
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onblocked = () => reject(new Error("Unable to open storage: database is blocked"));
      request.onerror = () => reject(request.error || new Error("Unable to open storage"));
    });
    this.#store = storeName;
  }

  /**
   * Runs an IndexedDB operation and resolves only after transaction completion.
   *
   * @template T
   * @param {IDBTransactionMode} mode
   * @param {(store: IDBObjectStore) => IDBRequest<T> | undefined} exec
   * @param {string} errorMessage
   * @returns {Promise<T | undefined>}
   */
  async #run(mode, exec, errorMessage) {
    const db = await this.#db;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.#store, mode);
      const store = tx.objectStore(this.#store);
      let settled = false;
      let result;

      tx.oncomplete = () => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      tx.onerror = () => {
        if (settled) return;
        settled = true;
        reject(tx.error || new Error(errorMessage));
      };

      tx.onabort = () => {
        if (settled) return;
        settled = true;
        reject(tx.error || new Error(errorMessage));
      };

      try {
        const request = exec(store);
        if (!request) return;
        request.onsuccess = () => {
          result = request.result;
        };
        request.onerror = () => {
          if (settled) return;
          settled = true;
          reject(request.error || new Error(errorMessage));
          try {
            tx.abort();
          } catch (error) {
            void error;
            // Ignore abort errors when transaction is already closed.
          }
        };
      } catch (error) {
        if (settled) return;
        settled = true;
        reject(error);
        try {
          tx.abort();
        } catch (abortError) {
          void abortError;
          // Ignore abort errors when transaction is already closed.
        }
      }
    });
  }

  /**
   * Stores a value by key.
   *
   * @param {IDBValidKey} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async setItem(key, value) {
    await this.#run("readwrite", (store) => store.put(value, key), "Unable to set item");
  }

  /**
   * Retrieves a value by key.
   *
   * @template T
   * @param {IDBValidKey} key
   * @returns {Promise<T | undefined>}
   */
  async getItem(key) {
    return this.#run("readonly", (store) => store.get(key), "Unable to get item");
  }

  /**
   * Removes a stored key.
   *
   * @param {IDBValidKey} key
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    await this.#run("readwrite", (store) => store.delete(key), "Unable to remove item");
  }

  /**
   * Clears all records from the configured object store.
   *
   * @returns {Promise<void>}
   */
  async clear() {
    await this.#run("readwrite", (store) => store.clear(), "Unable to clear storage");
  }

  /**
   * Closes the current database connection.
   *
   * @returns {Promise<void>}
   */
  async close() {
    const db = await this.#db;
    db.close();
  }
}

export { IndexedDB };
export default IndexedDB;
