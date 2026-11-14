/** @typedef {import("../lib/database.js").Schema} Schema */
/** @typedef {import("../lib/database.js").Database} SharedDatabase */

/** @type {Schema} */
const schema = Object.freeze({
  name: "TEXT",
  age: "INTEGER",
  score: "REAL",
  active: "BOOLEAN",
  details: "OBJECT",
  created: "DATE",
  bytes: "BLOB",
  empty: "NULL",
});

/** @param {() => unknown | Promise<unknown>} callback @param {string} [message] */
async function rejects(callback, message) {
  try {
    await callback();
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (message) expect(error.message).toMatch(message);
    return;
  }
  throw new Error("Expected the operation to fail.");
}

/** @param {SharedDatabase} db */
export async function closeAfterSchemaMismatch(db) {
  try {
    await db.close();
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("Schema mismatch")) throw error;
  }
}

/** @param {unknown} actual @param {unknown} expected */
function equal(actual, expected) {
  expect(JSON.stringify(actual)).toEqual(JSON.stringify(expected));
}

/**
 * @param {new (file: string, name: string, fields: Schema) => SharedDatabase} Database
 * @param {() => Promise<{file: string, cleanup: () => Promise<void>}>} fixture
 */
export function databaseContract(Database, fixture) {
  /**
   * @param {(db: SharedDatabase, open: (name?: string, fields?: Schema) => SharedDatabase) => Promise<void>} callback
   */
  async function withDatabase(callback) {
    const { file, cleanup } = await fixture();
    /** @type {SharedDatabase[]} */
    const connections = [];
    const open = (name = "records", fields = schema) => {
      const db = new Database(file, name, fields);
      connections.push(db);
      return db;
    };
    try {
      await callback(open(), open);
    } finally {
      try {
        await Promise.all(connections.map((db) => db.close()));
      } finally {
        await cleanup();
      }
    }
  }

  suite("Shared database", () => {
    test("round-trips every field type, defaults, partial updates and reopened storage", async () => {
      await withDatabase(async (db, open) => {
        const created = new Date("2026-01-02T03:04:05Z");
        const details = { nested: ["value", null, 1, true] };
        const bytes = new Uint8Array([0, 255, 42]);
        const promise = db.insert({ name: "Alice", age: 21, score: 1.5, active: true, details, created, bytes });
        expect(promise instanceof Promise).toEqual(true);
        const id = await promise;
        details.nested[0] = "changed";
        bytes[0] = 9;
        const row = await db.select().where({ id }).get();
        expect(row.id).toEqual(id);
        expect(row.name).toEqual("Alice");
        expect(row.age).toEqual(21);
        expect(row.score).toEqual(1.5);
        expect(row.active).toEqual(true);
        expect(row.created instanceof Date).toEqual(true);
        expect(row.created.getTime()).toEqual(created.getTime());
        equal(row.details, { nested: ["value", null, 1, true] });
        expect(row.bytes instanceof Uint8Array).toEqual(true);
        equal(Array.from(row.bytes), [0, 255, 42]);
        expect(row.empty).toEqual(null);
        expect(await db.update({ id, name: "Updated" })).toEqual(id);
        await db.close();
        const reopened = await open().select().where({ id }).get();
        expect(reopened.name).toEqual("Updated");
        expect(reopened.age).toEqual(21);
        expect(reopened.active).toEqual(true);
      });
    });

    test("supports ID zero, explicit-ID upserts and non-reused generated IDs", async () => {
      await withDatabase(async (db) => {
        expect(await db.upsert({ id: 0, name: "zero" })).toEqual(0);
        expect(await db.upsert({ id: 0, age: 20 })).toEqual(0);
        equal(await db.select(["name", "age"]).where({ id: 0 }).get(), { name: "zero", age: 20 });
        expect(await db.insert({ name: "first" })).toEqual(1);
        expect(await db.upsert({ id: 10, name: "ten" })).toEqual(10);
        expect(await db.delete(10)).toEqual(true);
        expect(await db.insert({ name: "next" })).toEqual(11);
        expect(await db.upsert({ name: "new" })).toEqual(12);
        expect(await db.delete(100)).toEqual(false);
      });
    });

    test("shares structured filters, ordering, projections and limit semantics", async () => {
      await withDatabase(async (db) => {
        await db.insert({ name: "Bob", age: 30, active: true });
        await db.insert({ name: "Alice", age: 20, active: true });
        await db.insert({ name: "Carol", age: 30, active: false });
        await db.insert({ name: "Aaron", age: 30, active: true });
        equal(
          await db
            .select("name")
            .where({ active: true })
            .where("age", ">=", 20)
            .orderBy("age", "desc")
            .orderBy("name")
            .limit(2)
            .all(),
          [{ name: "Aaron" }, { name: "Bob" }],
        );
        equal(await db.select("id").where("age", "<", 30).all(), [{ id: 2 }]);
        equal(await db.select("id").where("age", "<=", 20).all(), [{ id: 2 }]);
        equal(await db.select("id").where("age", ">", 20).all(), [{ id: 1 }, { id: 3 }, { id: 4 }]);
        equal(await db.select("id").where("name", "!=", "Bob").all(), [{ id: 2 }, { id: 3 }, { id: 4 }]);
        equal(await db.select("id").where("age", "=", 30).all(), [{ id: 1 }, { id: 3 }, { id: 4 }]);
        equal(await db.select().limit(0).all(), []);
        expect(await db.select().limit(0).get()).toEqual(undefined);
        expect(await db.select().where({ id: 999 }).get()).toEqual(undefined);
      });
    });

    test("treats null consistently and compares dates chronologically", async () => {
      await withDatabase(async (db) => {
        await db.insert({ name: "missing" });
        await db.insert({ name: "present", age: 1, created: new Date(0) });
        await db.insert({ name: "ancient", created: new Date(-62198755200000) });
        equal(await db.select("id").where({ age: null }).all(), [{ id: 1 }, { id: 3 }]);
        equal(await db.select("id").where("age", "!=", null).all(), [{ id: 2 }]);
        equal(await db.select("id").where("age", ">", 0).all(), [{ id: 2 }]);
        equal(await db.select("id").orderBy("age").all(), [{ id: 1 }, { id: 3 }, { id: 2 }]);
        equal(await db.select("id").where("created", "<", new Date(0)).all(), [{ id: 3 }]);
      });
    });

    test("validates inputs without modifying stored records", async () => {
      await withDatabase(async (db) => {
        const id = await db.insert({ name: "Robert'); DROP TABLE records;--", age: 10 });
        equal(await db.select("id").where({ name: "Robert'); DROP TABLE records;--" }).all(), [{ id }]);
        await rejects(() => db.insert({ unknown: "bad" }), "Invalid field");
        await rejects(() => db.insert({ id: 20 }), "upsert");
        await rejects(() => db.insert({ age: 1.5 }), "INTEGER");
        await rejects(() => db.update({ id, age: "wrong" }), "INTEGER");
        await rejects(() => db.insert({ active: 1 }), "BOOLEAN");
        await rejects(() => db.insert({ created: new Date(NaN) }), "DATE");
        await rejects(() => db.insert({ score: Infinity }), "REAL");
        await rejects(() => db.insert({ name: undefined }), "TEXT");
        await rejects(() => db.insert({ details: { value: undefined } }), "JSON");
        await rejects(() => db.insert({ bytes: [1, 2] }), "BLOB");
        await rejects(() => db.upsert({ id: -1 }), "IDs");
        await rejects(() => db.delete(1.5), "IDs");
        await rejects(() => db.update({ id: 999, name: "absent" }), "does not exist");
        expect((await db.select().all()).length).toEqual(1);
        expect((await db.select().get()).age).toEqual(10);
      });
    });

    test("rejects raw SQL, invalid fields and unsupported query options", async () => {
      await withDatabase(async (db) => {
        await rejects(() => db.select().where("age > 1"), "Invalid field");
        await rejects(() => db.select().where("age", "LIKE", 1), "operator");
        await rejects(() => db.select().where("age", ">", null), "Null");
        await rejects(() => db.select().where({ age: "wrong" }), "INTEGER");
        await rejects(() => db.select("unknown"), "Invalid field");
        await rejects(() => db.select([]), "Select");
        await rejects(() => db.select().orderBy("name DESC"), "Invalid field");
        await rejects(() => db.select().orderBy("details"), "cannot");
        await rejects(() => db.select().where({ bytes: null }), "cannot");
        await rejects(() => db.select().limit(-1), "Limit");
        await rejects(() => db.select().limit(0).limit(1), "already");
      });
    });

    test("supports multiple tables and canonical schema reopening", async () => {
      await withDatabase(async (db, open) => {
        await db.insert({ name: "one" });
        const other = open("other", { value: "TEXT" });
        expect(await other.insert({ value: "two" })).toEqual(1);
        expect((await db.select().all()).length).toEqual(1);
        const reordered = Object.fromEntries(Object.entries(schema).reverse());
        expect((await open("RECORDS", reordered).select().get()).name).toEqual("one");
      });
    });

    test("serializes concurrent inserts and merges concurrent partial upserts", async () => {
      await withDatabase(async (db, open) => {
        const other = open();
        const ids = await Promise.all(Array.from({ length: 12 }, (_, i) => (i % 2 ? other : db).insert({ age: i })));
        expect(new Set(ids).size).toEqual(12);
        equal(
          [...ids].sort((a, b) => a - b),
          Array.from({ length: 12 }, (_, i) => i + 1),
        );
        await Promise.all([db.upsert({ id: 30, name: "shared" }), other.upsert({ id: 30, age: 99 })]);
        equal(await db.select(["name", "age"]).where({ id: 30 }).get(), { name: "shared", age: 99 });
      });
    });

    test("captures query filters when execution begins", async () => {
      await withDatabase(async (db) => {
        await db.insert({ age: 1 });
        await db.insert({ age: 2 });
        const query = db.select("id");
        const first = query.all();
        query.where({ age: 2 });
        equal(await first, [{ id: 1 }, { id: 2 }]);
        equal(await query.all(), [{ id: 2 }]);
      });
    });

    test("close is idempotent and rejects subsequent operations", async () => {
      await withDatabase(async (db) => {
        await db.insert({});
        await db.close();
        await db.close();
        await rejects(() => db.insert({}), "closed");
        await rejects(() => db.select().all(), "closed");
      });
    });

    test("closing during initialization prevents writes and releases the connection", async () => {
      await withDatabase(async (db, open) => {
        const operation = rejects(() => db.insert({ name: "not committed" }), "closed");
        await db.close();
        await operation;
        equal(await open().select().all(), []);
      });
    });

    test("rejects cyclic objects and handles empty schemas and no-op updates", async () => {
      await withDatabase(async (db, open) => {
        const circular = {};
        circular.self = circular;
        await rejects(() => db.insert({ details: circular }), "cycles");
        const empty = open("empty", {});
        const id = await empty.insert({});
        equal(await empty.select().get(), { id });
        expect(await empty.update({ id })).toEqual(id);
      });
    });

    test("rolls back failed writes without advancing the ID sequence", async () => {
      await withDatabase(async (db) => {
        await rejects(() => db.upsert({ id: Number.MAX_SAFE_INTEGER, name: "overflow" }), "exhausted");
        equal(await db.select().all(), []);
        expect(await db.insert({ name: "first" })).toEqual(1);
      });
    });

    test("captures update and upsert IDs before awaiting storage", async () => {
      await withDatabase(async (db) => {
        await db.insert({ name: "first" });
        await db.insert({ name: "second" });
        const fields = { id: 1, name: "updated" };
        const update = db.update(fields);
        fields.id = 2;
        expect(await update).toEqual(1);
        const patch = { id: 1, age: 10 };
        const upsert = db.upsert(patch);
        patch.id = 2;
        expect(await upsert).toEqual(1);
        equal(await db.select(["name", "age"]).where({ id: 1 }).get(), { name: "updated", age: 10 });
        expect((await db.select().where({ id: 2 }).get()).name).toEqual("second");
      });
    });
  });
}
