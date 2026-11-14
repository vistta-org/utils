import direct from "@vistta/fs";
import { fs as namespace } from "@vistta/utils";
import fs, { readFile } from "@vistta/utils/fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

suite("Utils filesystem (Node)", () => {
  test("forwards the default, named and root namespace exports", () => {
    expect(fs === direct).toEqual(true);
    expect(namespace === direct).toEqual(true);
    expect(readFile === direct.readFile).toEqual(true);
  });

  test("uses the Node filesystem through the facade", async () => {
    const directory = await mkdtemp(join(tmpdir(), "vistta-utils-fs-"));
    const file = join(directory, "file.txt");
    try {
      fs.writeFileSync(file, "hello");
      expect(await readFile(file, "utf8")).toEqual("hello");
      await namespace.appendFile(file, " world");
      expect(fs.readFileSync(file, "utf8")).toEqual("hello world");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
