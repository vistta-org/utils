import * as utils from "../index.js";

const text = "hello world!";

suite("Utils", () => {
  // generic
  test("equals primitives", () => {
    expect(utils.equals(1, 1)).toEqual(true);
    expect(utils.equals("a", "a")).toEqual(true);
    expect(utils.equals(true, true)).toEqual(true);
    expect(utils.equals(1, 2)).toEqual(false);
    expect(utils.equals("a", "b")).toEqual(false);
    expect(utils.equals(1, "1")).toEqual(false);
  });

  test("equals nullish", () => {
    expect(utils.equals(null, null)).toEqual(true);
    expect(utils.equals(undefined, undefined)).toEqual(true);
    expect(utils.equals(null, undefined)).toEqual(false);
    expect(utils.equals(null, 0)).toEqual(false);
  });

  test("equals arrays", () => {
    expect(utils.equals([1, 2, 3], [1, 2, 3])).toEqual(true);
    expect(utils.equals([1, 2, 3], [1, 2])).toEqual(false);
    expect(utils.equals([1, 2, 3], [3, 2, 1])).toEqual(false);
    expect(utils.equals([{ a: 1 }], [{ a: 1 }])).toEqual(true);
    expect(utils.equals([], [])).toEqual(true);
  });

  test("equals objects", () => {
    expect(utils.equals({ prop: text }, { prop: text })).toEqual(true);
    expect(utils.equals({ a: 1 }, { a: 2 })).toEqual(false);
    expect(utils.equals({ a: 1 }, { a: 1, b: 2 })).toEqual(false);
    expect(utils.equals({ a: { b: 1 } }, { a: { b: 1 } })).toEqual(true);
    expect(utils.equals({ a: { b: 1 } }, { a: { b: 2 } })).toEqual(false);
  });

  test("equals dates", () => {
    const d1 = new Date("2024-01-01T00:00:00Z");
    const d2 = new Date("2024-01-01T00:00:00Z");
    expect(utils.equals(d1, d2)).toEqual(true);
    expect(utils.equals(d1, new Date("2025-01-01T00:00:00Z"))).toEqual(false);
  });

  test("equals different constructors", () => {
    class A {}
    class B {}
    expect(utils.equals(new A(), new B())).toEqual(false);
  });

  test("setImmediate", async () => {
    const result = await utils.setImmediate(() => text);
    expect(result).toEqual(text);
  });

  test("sleep", async () => {
    const now = new Date().getTime();
    const time = 250;
    await utils.sleep(time);
    expect(new Date().getTime() - now >= time).toEqual(true);
  });

  test("debounce", async () => {
    let counter = 0;
    const debounced = utils.debounce(() => {
      counter++;
    }, 100);
    debounced();
    debounced();
    debounced();
    await utils.sleep(200);
    expect(counter).toEqual(1);
  });

  test("debounce uses last arguments", async () => {
    let captured = null;
    const debounced = utils.debounce((val) => {
      captured = val;
    }, 100);
    debounced("first");
    debounced("second");
    debounced("third");
    await utils.sleep(200);
    expect(captured).toEqual("third");
  });

  test("throttle", async () => {
    let counter = 0;
    const throttled = utils.throttle(() => {
      counter++;
    }, 100);
    throttled();
    throttled();
    throttled();
    await utils.sleep(200);
    expect(counter).toEqual(1);
    throttled();
    await utils.sleep(150);
    expect(counter).toEqual(2);
  });

  test("formatSize", () => {
    expect(utils.formatSize(0)).toEqual("0 B");
    expect(utils.formatSize(512)).toEqual("512 B");
    expect(utils.formatSize(1024)).toEqual("1.00 KB");
    expect(utils.formatSize(1536)).toEqual("1.50 KB");
    expect(utils.formatSize(1024 * 1024)).toEqual("1.00 MB");
    expect(utils.formatSize(1024 * 1024 * 1024)).toEqual("1.00 GB");
    expect(utils.formatSize(1024 * 1024 * 1024 * 1024)).toEqual("1.00 TB");
    expect(utils.formatSize(1536, 1)).toEqual("1.5 KB");
  });

  test("formatSize edge cases", () => {
    expect(utils.formatSize(-100)).toEqual("0 B");
    expect(utils.formatSize(NaN)).toEqual("0 B");
    expect(utils.formatSize(Infinity)).toEqual("0 B");
    expect(utils.formatSize(1024 * 1024 * 1024 * 1024 * 1024)).toEqual("1.00 PB");
    expect(utils.formatSize(1024, 0)).toEqual("1 KB");
  });

  test("runEvery minute", async () => {
    let counter = 0;
    const cancel = utils.runEvery(() => {
      counter++;
    }, "minute");
    expect(typeof cancel).toEqual("function");
    cancel();
    expect(counter).toEqual(0);
  });

  test("runEvery hour", () => {
    let counter = 0;
    const cancel = utils.runEvery(() => {
      counter++;
    }, "hour");
    expect(typeof cancel).toEqual("function");
    cancel();
    expect(counter).toEqual(0);
  });

  test("runEvery second", () => {
    let counter = 0;
    const cancel = utils.runEvery(() => {
      counter++;
    }, "second");
    expect(typeof cancel).toEqual("function");
    cancel();
    expect(counter).toEqual(0);
  });

  test("runEvery day", () => {
    let counter = 0;
    const cancel = utils.runEvery(() => {
      counter++;
    }, "day");
    expect(typeof cancel).toEqual("function");
    cancel();
    expect(counter).toEqual(0);
  });

  test("runEvery with count prefix", () => {
    let counter = 0;
    const cancel = utils.runEvery(() => {
      counter++;
    }, "2 minutes");
    expect(typeof cancel).toEqual("function");
    cancel();
    expect(counter).toEqual(0);
  });

  test("runEvery with singular count prefix", () => {
    let counter = 0;
    const cancel = utils.runEvery(() => {
      counter++;
    }, "1 day");
    expect(typeof cancel).toEqual("function");
    cancel();
    expect(counter).toEqual(0);
  });

  test("runEvery invalid unit throws", () => {
    expect(() => utils.runEvery(() => {}, "week")).toThrow();
  });

  test("BoundClass binds methods", () => {
    class MyClass extends utils.BoundClass {
      constructor() {
        super();
        this.value = text;
      }
      getValue() {
        return this.value;
      }
    }
    const instance = new MyClass();
    const fn = instance.getValue;
    expect(fn()).toEqual(text);
  });

  test("BoundClass does not bind constructor", () => {
    class MyClass extends utils.BoundClass {
      constructor() {
        super();
        this.value = 42;
      }
    }
    const instance = new MyClass();
    expect(instance.value).toEqual(42);
  });

  // array

  test("ensureArray", () => {
    expect(Array.isArray(utils.ensureArray({ prop: text }))).toEqual(true);
  });

  test("addUnique", () => {
    const array = [];
    utils.addUnique(array, text);
    expect(array.length).toEqual(1);
    utils.addUnique(array, text);
    expect(array.length).toEqual(1);
  });

  test("join", () => {
    const array = [1, 2, 3];
    expect(utils.join(array, "-", (v) => v * 2)).toEqual("2-4-6");
  });

  // color

  test("formatColor", () => {
    expect(utils.formatColor("#FF0000", "rgb")).toEqual("rgb(255, 0, 0)");
    expect(utils.formatColor("rgb(255, 0, 0)", "hsl")).toEqual("hsl(0, 100%, 50%)");
    expect(utils.formatColor("hsl(0, 100%, 50%)", "hex")).toEqual("#FF0000");
  });

  test("mixColors", () => {
    expect(utils.mixColors("#FF0000", "#0000FF", "hex", 0.5)).toEqual("#BC00BC");
  });

  test("contrastColor", () => {
    expect(utils.contrastColor("#000000")).toEqual("#FFFFFF");
    expect(utils.contrastColor("#FFFFFF")).toEqual("#000000");
  });

  // object

  test("isObject", () => {
    expect(utils.isObject({})).toEqual(true);
  });

  test("isObjectEmpty", () => {
    expect(utils.isObjectEmpty({})).toEqual(true);
  });

  test("isPlainObject", () => {
    expect(utils.isPlainObject({})).toEqual(true);
    expect(!utils.isPlainObject(new Date())).toEqual(true);
  });

  test("stringify", () => {
    expect(utils.stringify({})).toEqual("{}");
  });

  test("parse", () => {
    expect(utils.equals(utils.parse("{}"), {})).toEqual(true);
  });

  test("clone", () => {
    const obj = { prop: text };
    const cloned = utils.clone(obj);
    expect(utils.equals(cloned, obj) && obj !== cloned).toEqual(true);
  });

  test("flatten", () => {
    expect(utils.flatten({ prop: { key: text } })["prop.key"]).toEqual(text);
  });

  test("assign", () => {
    const a = { test: { a: 1 } };
    utils.assign(a, { test: { b: 2 } });
    expect(a.test.a).toEqual(1);
    expect(a.test.b).toEqual(2);
  });

  test("extract", () => {
    const object = { key: "value" };
    expect(utils.extract(object, "key")[0]).toEqual("value");
  });

  test("traverse", () => {
    const object = { a: { b: { c: 1 } }, d: 2 };
    const result = [];
    utils.traverse(object, (value, path) => result.push({ value, path }));
    expect(JSON.stringify(result)).toEqual(
      JSON.stringify([
        { value: 1, path: ["a", "b", "c"] },
        { value: 2, path: ["d"] },
      ]),
    );
  });

  test("remove", () => {
    const object = { key: "value" };
    utils.remove(object, "key");
    expect(typeof object.key === "undefined").toEqual(true);
  });

  // promise

  test("isPromise", () => {
    expect(utils.isPromise(new Promise((resolve) => setTimeout(resolve, 1000)))).toEqual(true);
  });

  test("isAsync", () => {
    expect(utils.isAsync(async () => {})).toEqual(true);
  });

  test("async", async () => {
    const test1 = async () => "test";
    const test2 = () => "test";
    expect(await utils.async(test1())).toEqual(await utils.async(test2()));
    const test3 = (callback) => callback(true);
    expect(await utils.async(test3)).toEqual(true);
  });

  // request

  test("request", async () => {
    expect(typeof utils.request).toEqual("function");
    expect(typeof utils.request.get).toEqual("function");
    expect(typeof utils.request.post).toEqual("function");
    expect(typeof utils.request.head).toEqual("function");
    expect(typeof utils.request.put).toEqual("function");
    expect(typeof utils.request.delete).toEqual("function");
    expect(typeof utils.request.connect).toEqual("function");
    expect(typeof utils.request.options).toEqual("function");
    expect(typeof utils.request.trace).toEqual("function");
    expect(typeof utils.request.patch).toEqual("function");
  });

  // string

  test("encoding", () => {
    expect(utils.decode(utils.encode(text))).toEqual(text);
  });

  test("capitalize", () => {
    expect(utils.capitalize(text)).toEqual("Hello world!");
  });

  test("abbreviate", () => {
    expect(utils.abbreviate("1000")).toEqual("1K");
  });

  test("isIPAddress", () => {
    expect(utils.isIPAddress("127.0.0.0")).toEqual(true);
  });

  test("isValidUrl", () => {
    expect(utils.isValidUrl("https://google.com")).toEqual(true);
  });

  test("isValidUrlPathname", () => {
    expect(utils.isValidUrlPathname("/test")).toEqual(true);
  });

  test("isNumeric", () => {
    expect(utils.isNumeric("1234")).toEqual(true);
  });
});
