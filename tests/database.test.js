import Database, { Database as NamedDatabase } from "@vistta/utils/database";
import { Database as NodeExport } from "@vistta/utils/node";
import NodeDatabase from "@vistta/utils/node/database";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closeAfterSchemaMismatch, databaseContract } from "./database-contract.js";

databaseContract(Database, async () => {
  const directory = await mkdtemp(join(tmpdir(), "vistta-database-"));
  return { file: join(directory, "database.sqlite"), cleanup: () => rm(directory, { recursive: true, force: true }) };
});

suite("Database Node entry", () => {
  test("selects the same SQLite implementation for all Node entry points", () => {
    expect(Database === NamedDatabase).toEqual(true);
    expect(Database === NodeDatabase).toEqual(true);
    expect(Database === NodeExport).toEqual(true);
  });

  test("rejects invalid schemas before opening a database", () => {
    for (const fields of [{ id: "TEXT" }, { Name: "TEXT", name: "TEXT" }, { value: "INVALID" }]) {
      expect(() => Reflect.construct(Database, [":memory:", "records", fields])).toThrow();
    }
    expect(() => new Database(":memory:", "bad;table", {})).toThrow();
  });

  test("rejects schema changes rather than silently opening an incompatible table", async () => {
    const directory = await mkdtemp(join(tmpdir(), "vistta-database-schema-"));
    const file = join(directory, "database.sqlite");
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
      await rm(directory, { recursive: true, force: true });
    }
  });
});
