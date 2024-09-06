import * as utils from "../index.js";

const text = "hello world!";

describe("Utils", () => {
  // generic
  it("equals", () => {
    assert.ok(utils.equals({ prop: text }, { prop: text }));
  });

  it("setImmediate", async () => {
    const result = await (new Promise((resolve) =>
      setImmediate(() => resolve(text))
    ))
    assert.equal(result, text);
  });

  it("sleep", async () => {
    const now = new Date().getTime();
    const time = 250;
    await utils.sleep(time);
    assert.ok((new Date().getTime() - now) >= time)
  });

  // object

  it("isObject", () => {
    assert.ok(utils.isObject({}));
  });

  it("isObjectEmpty", () => {
    assert.ok(utils.isObjectEmpty({}));
  });

  it("isPlainObject", () => {
    assert.ok(utils.isPlainObject({}));
    assert.ok(!utils.isPlainObject(new Date()));
  });

  it("stringify", () => {
    assert.equal(utils.stringify({}), "{}");
  });

  it("parse", () => {
    assert.ok(utils.equals(utils.parse("{}"), {}));
  });

  it("clone", () => {
    const obj = { prop: text };
    const cloned = utils.clone(obj);
    assert.ok(utils.equals(cloned, obj) && obj !== cloned);
  });

  it("flatten", () => {
    assert.equal(utils.flatten({ prop: { key: text } })["prop.key"], text);
  });

  it("assign", () => {
    const a = { "test": { "a": 1 } };
    utils.assign(a, { "test": { "b": 2 } });
    assert.equal(a.test.a, 1);
    assert.equal(a.test.b, 2);
  });

  it("extract", () => {
    const object = { key: "value" };
    assert.equal(utils.extract(object, "key")[0], "value");
  });

  it("remove", () => {
    const object = { key: "value" };
    utils.remove(object, "key");
    assert.ok(typeof object.key === "undefined");
  });

  // promise

  it("isPromise", () => {
    assert.ok(utils.isPromise(new Promise((resolve) => setTimeout(resolve, 1000))));
  });

  it("isAsync", () => {
    assert.ok(utils.isAsync(async () => { }));
  });

  it("async", async () => {
    const test1 = async () => "test";
    const test2 = () => "test";
    assert.equal(await utils.async(test1()), await utils.async(test2()));
    const test3 = (callback) => callback(true);
    assert.ok(await utils.async(test3));
  });

  // request

  it("request", async () => {
    assert.equal(typeof utils.request, "function");
    assert.equal(typeof utils.request.get, "function");
    assert.equal(typeof utils.request.post, "function");
    assert.equal(typeof utils.request.head, "function");
    assert.equal(typeof utils.request.put, "function");
    assert.equal(typeof utils.request.delete, "function");
    assert.equal(typeof utils.request.connect, "function");
    assert.equal(typeof utils.request.options, "function");
    assert.equal(typeof utils.request.trace, "function");
    assert.equal(typeof utils.request.patch, "function");
  });

  // string

  it("encoding", () => {
    assert.equal(utils.decode(utils.encode(text)), text);
  });

  it("capitalize", () => {
    assert.equal(utils.capitalize(text), "Hello world!");
  });

  it("abbreviate", () => {
    assert.equal(utils.abbreviate("1000"), "1K");
  });

  it("isIPAddress", () => {
    assert.ok(utils.isIPAddress("127.0.0.0"));
  });

  it("isValidUrl", () => {
    assert.ok(utils.isValidUrl("https://google.com"));
  });

  it("isValidUrlPathname", () => {
    assert.ok(utils.isValidUrlPathname("/test"));
  });
});
