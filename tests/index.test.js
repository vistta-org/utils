import * as utils from "../index.js";

const text = "hello world!";

describe("Utils", () => {
  it("equals", () => {
    assert.ok(utils.equals({ prop: text }, { prop: text }));
  });

  it("isPromise", () => {
    assert.ok(utils.isPromise(new Promise((resolve) => setTimeout(resolve, 1000))));
  });

  it("isAsync", () => {
    assert.ok(utils.isAsync(async () => { }));
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

  it("isObject", () => {
    assert.ok(utils.isObject({}));
  });

  it("isObjectEmpty", () => {
    assert.ok(utils.isObjectEmpty({}));
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

  it("copyPropertyDescriptors", () => {
    const obj = {};
    Object.defineProperty(obj, 'prop', {
      value: text,
      writable: false,
    });
    assert.equal(utils.copyPropertyDescriptors({}, obj).prop, text);
  });

  it("flatten", () => {
    assert.equal(utils.flatten({ prop: { key: text } })["prop.key"], text);
  });

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
