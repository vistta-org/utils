import LegacyIndexedDB from "@vistta/utils/browser/indexedDB";
import Database, { Database as NamedDatabase } from "@vistta/utils/database";
import BrowserDatabase from "../lib/browser/database.js";
import { closeAfterSchemaMismatch, databaseContract } from "./database-contract.js";

/** @param {string} file */
function cleanup(file) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase("@vistta/utils/database:" + file);
    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error || new Error("Unable to remove test database."));
    request.onblocked = () => reject(new Error("Test database cleanup is blocked."));
  });
}

databaseContract(Database, async () => {
  const file = "vistta-database-test-" + crypto.randomUUID();
  return { file, cleanup: () => cleanup(file) };
});

suite("Database browser entry", () => {
  test("selects IndexedDB and preserves the legacy import", () => {
    expect(Database === NamedDatabase).toEqual(true);
    expect(Database === BrowserDatabase).toEqual(true);
    expect(Object.is(Database, LegacyIndexedDB)).toEqual(false);
  });

  test("rejects incompatible schemas and closes failed connections", async () => {
    const file = "vistta-database-schema-test-" + crypto.randomUUID();
    const original = new Database(file, "records", { value: "TEXT" });
    const mismatch = new Database(file, "records", { value: "INTEGER" });
    try {
      await original.insert({ value: "data" });
      let rejected = false;
      try {
        await mismatch.select().all();
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        expect(error.message).toMatch("Schema mismatch");
        rejected = true;
      }
      expect(rejected).toEqual(true);
      expect((await original.select().get()).value).toEqual("data");
    } finally {
      await original.close();
      await closeAfterSchemaMismatch(mismatch);
      await cleanup(file);
    }
  });
});
