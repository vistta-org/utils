import * as utils from "../index.js";

const text = "hello world!";

suite("Utils", () => {
  // generic
  test("equals", () => {
    expect(utils.equals({ prop: text }, { prop: text })).toEqual(true);
  });

  test("setImmediate", async () => {
    const result = await new Promise((resolve) => setImmediate(() => resolve(text)));
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
});
