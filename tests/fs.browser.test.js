import direct from "@vistta/fs/browser";
import { fs as namespace } from "@vistta/utils";
import fs, { readFile, readFileSync } from "@vistta/utils/fs";

suite("Utils filesystem (browser)", () => {
  test("forwards the browser implementation through both utils entry points", () => {
    expect(Object.is(fs, direct)).toEqual(true);
    expect(Object.is(namespace, direct)).toEqual(true);
    expect(Object.is(readFile, direct.readFile)).toEqual(true);
    let thrown = false;
    try {
      Reflect.apply(readFileSync, undefined, ["file.txt"]);
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error)) throw error;
      expect(error.code).toEqual("ERR_FS_BROWSER_UNSUPPORTED");
      thrown = true;
    }
    expect(thrown).toEqual(true);
  });

  test("reads and writes real OPFS files through the facade", async () => {
    const directory = "vistta-utils-fs-test-" + crypto.randomUUID();
    await fs.mkdir(directory);
    try {
      const file = `${directory}/file.txt`;
      await fs.writeFile(file, "hello");
      await namespace.appendFile(file, " world");
      expect(await readFile(file, "utf8")).toEqual("hello world");
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
});
