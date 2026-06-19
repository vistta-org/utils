/**
 * @typedef {Object} RequestResponse
 * @property {any} data Request response data.
 * @property {number} status Request status code.
 * @property {string} statusText Request status text.
 * @property {Headers} headers Request headers.
 */

/**
 * @typedef {Promise<RequestResponse> & { abort: () => void }} RequestPromise
 */

/**
 * @typedef {{ onRequest?: Function, onResponse?: Function, onResponseError?: Function, onError?: Function }} RequestPlugin
 * @typedef {{ onRequest?: Function, onResponse?: Function, onResponseError?: Function, onError?: Function }} RequestHook
 */

/**
 * @typedef {{ auth?: string | (() => string | Promise<string>), hooks?: RequestHook[], fetch?: Function }} RequestRuntime
 */

/**
 * The options for making a request.
 * @typedef {Object} Options
 * @property {string} [method] - The HTTP method for the request (e.g. GET, POST).
 * @property {{ [key: string]: string }} [headers] - Additional parameters to pass with the request.
 * @property {AbortController} [controller] - An AbortController instance that can be used to abort the request.
 * @property {{ [key: string]: string }} [params] - Additional parameters to pass with the request.
 * @property {"blob" | "json" | "arrayBuffer" | "formData" | "text"} [content] - The response data type.
 * @property {number} [timeout] - The maximum time in milliseconds to wait for a response before aborting the request.
 * @property {BodyInit|Object|FormData} [body] - The body of the request.
 * @property {boolean} [stream] If true, the response will be returned as a stream.
 * @property {number} [retries] - The number of times to retry the request if it fails.
 * @property {"omit" | "same-origin" | "include"} [credentials] - The credentials policy for the request.
 * @property {Record<string, any>} [meta] - Internal metadata used by request hooks.
 */

/**
 * Sends an HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {RequestPromise} A promise that resolves to the response.
 */
const request = (
  url,
  { method = "get", controller, headers, params, timeout, content, stream, retries = 0, meta = {}, ...options } = {},
) => {
  if (!controller) controller = new AbortController();
  const { body, contentType } = transformBody(options?.body);
  const query = params ? new URLSearchParams(params).toString() : "";
  let timer;
  const helper = async (attempt = 0, state = { headers, body, options, meta: { ...meta } }) => {
    try {
      const normalizedMethod = method?.toUpperCase();
      const normalizedHeaders = await buildHeaders(url, state.headers, contentType, method);
      const requestUrl = query ? `${url}?${query}` : url;
      const parsedUrl = toURL(requestUrl);
      const requestContext = {
        url: requestUrl,
        parsedUrl,
        method: normalizedMethod,
        headers: normalizedHeaders,
        body: state.body,
        options: state.options,
        attempt,
        meta: state.meta,
      };
      const before = await runRequestHooks(requestContext);
      if (before) {
        state = {
          headers: before.headers || state.headers,
          body: before.body === undefined ? state.body : before.body,
          options: before.options || state.options,
          meta: before.meta || state.meta,
        };
        requestContext.headers = await buildHeaders(url, state.headers, contentType, method);
        requestContext.body = state.body;
        requestContext.options = state.options;
        requestContext.meta = state.meta;
      }
      if (timeout) timer = setTimeout(() => controller.abort(), timeout);
      const response = await runtime.fetch(requestUrl, {
        ...requestContext.options,
        credentials: requestContext.options?.credentials,
        headers: requestContext.headers,
        body: requestContext.body,
        method: requestContext.method,
        signal: controller.signal,
      });
      if (!response.ok) {
        const retry = await runResponseErrorHooks({
          ...requestContext,
          response,
        });
        if (retry?.retry) {
          if (retry.meta) state.meta = { ...(state.meta || {}), ...retry.meta };
          if (retry.headers) state.headers = retry.headers;
          if (retry.body !== undefined) state.body = retry.body;
          if (retry.options) state.options = retry.options;
          return helper(attempt + 1, state);
        }
        throw await createResponseError(response);
      }
      if (stream)
        return {
          data: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      const payload = {
        data: await response[content || convertResponse(response.headers.get("content-type"))](),
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
      await runResponseHooks({ ...requestContext, response, payload });
      return payload;
    } catch (error) {
      if (controller.signal.aborted) throw new Error("Request aborted");
      if (retries > attempt) return helper(attempt + 1);
      await runErrorHooks({
        url,
        parsedUrl: toURL(query ? `${url}?${query}` : url),
        method: method?.toUpperCase(),
        headers,
        body,
        options,
        attempt,
        meta,
        error,
      });
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };
  const result = /** @type {RequestPromise} */ (helper());
  result.abort = () => controller.abort();
  return result;
};

/**
 * Sends a GET HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {RequestPromise} A promise that resolves to the response data.
 */
request.get = (url, options) => request(url, { method: "get", ...options });

/**
 * Sends a POST HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {RequestPromise} A promise that resolves to the response data.
 */
request.post = (url, options) => request(url, { method: "post", ...options });

/**
 * Sends a HEAD HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {RequestPromise} A promise that resolves to the response data.
 */
request.head = (url, options) => request(url, { method: "head", ...options });

/**
 * Sends a PUT HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {RequestPromise} A promise that resolves to the response data.
 */
request.put = (url, options) => request(url, { method: "put", ...options });

/**
 * Sends a DELETE HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {RequestPromise} A promise that resolves to the response data.
 */
request.delete = (url, options) => request(url, { method: "delete", ...options });

/**
 * Sends a CONNECT HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {RequestPromise} A promise that resolves to the response data.
 */
request.connect = (url, options) => request(url, { method: "connect", ...options });

/**
 * Sends an OPTIONS HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {RequestPromise} A promise that resolves to the response data.
 */
request.options = (url, options) => request(url, { method: "options", ...options });

/**
 * Sends a TRACE HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {RequestPromise} A promise that resolves to the response data.
 */
request.trace = (url, options) => request(url, { method: "trace", ...options });

/**
 * Sends a PATCH HTTP request and returns a Promise that resolves to the response.
 *
 * @param {string} url - The URL for the request.
 * @param {Options} [options] Options for the request.
 * @returns {RequestPromise} A promise that resolves to the response data.
 */
request.patch = (url, options) => request(url, { method: "patch", ...options });

/**
 * Sets the bearer token for all requests.
 *
 * @param {string | (() => string | Promise<string>)} token - The bearer token to set.
 */
request.setAuthorization = (token) => {
  runtime.auth = token;
};

/**
 * Gets the current bearer token for requests.
 *
 * @returns {string | (() => string | Promise<string>) | null} The current bearer token, or null if not set.
 */
request.getAuthorization = () => {
  return runtime?.auth || null;
};

/**
 * Registers a request hook.
 *
 * @param {RequestHook} hook
 * @returns {() => void} Remove hook function.
 */
request.use = (hook) => {
  if (!hook || typeof hook !== "object") throw new TypeError("Request hook must be an object");
  runtime.hooks ||= [];
  runtime.hooks.push(hook);
  return () => {
    runtime.hooks = (runtime?.hooks || []).filter((current) => current !== hook);
  };
};

/**
 * Replaces the fetch function used for requests.
 *
 * @param {Function} fetch - The fetch function to use.
 */
request.replaceFetch = (fetch) => {
  if (typeof fetch !== "function") throw new TypeError("Fetch must be a function");
  runtime.fetch = fetch;
};

/**
 * Removes all request hooks.
 */
request.reset = () => {
  runtime.hooks = [];
};

export { request };

//

const runtime = /** @type {RequestRuntime} */ (globalThis[Symbol.for("vistta.internal.request")] ||= {});

runtime.fetch ||= globalThis.fetch.bind(globalThis);
runtime.hooks ||= [];

function transformBody(body) {
  if (body instanceof FormData) return { body: body, contentType: "auto" };
  return { body: JSON.stringify(body), contentType: "default" };
}

async function buildHeaders(url, headers, contentType, method) {
  if (!(headers instanceof Headers)) headers = new Headers(typeof headers === "object" ? headers : {});
  if (runtime?.auth) {
    if (typeof runtime.auth === "function") headers.set("authorization", `Bearer ${await runtime.auth()}`);
    else headers.set("authorization", `Bearer ${runtime.auth}`);
  }
  if (!headers.get("accept")) headers.set("accept", "application/json, text/plain, */*");
  headers.set("path", url);
  headers.set("method", method || "GET");
  if (!headers.get("sec-fetch-mode")) headers.set("sec-fetch-mode", "cors");
  if (!headers.get("sec-fetch-site")) headers.set("sec-fetch-site", "same-origin");
  if (contentType !== "auto" && !headers.get("Content-Type"))
    headers.set("Content-Type", contentType !== "default" ? contentType : "application/json");
  return headers;
}

function convertResponse(contentType) {
  if (typeof contentType !== "string") return "blob";
  if (contentType.includes("application/json")) return "json";
  if (contentType.includes("application/octet-stream")) return "arrayBuffer";
  if (contentType.includes("multipart/form-data")) return "formData";
  if (contentType.includes("text/")) return "text";
  return "blob";
}

async function createResponseError(response) {
  const message = (await response.text()) || `${response.status} ${response.statusText || ""}`.trim();
  const error = /** @type {Error & { status?: number, statusText?: string, headers?: Headers }} */ (new Error(message));
  error.status = response.status;
  error.statusText = response.statusText;
  error.headers = response.headers;
  return error;
}

function toURL(url) {
  try {
    return new URL(url);
  } catch {
    return new URL(url, "http://localhost");
  }
}

async function runRequestHooks(context) {
  const hooks = runtime?.hooks || [];
  for (let i = 0, len = hooks.length; i < len; i++) {
    const hook = hooks[i]?.onRequest;
    if (typeof hook !== "function") continue;
    const result = await hook(context);
    if (result) return result;
  }
  return null;
}

async function runResponseHooks(context) {
  const hooks = runtime?.hooks || [];
  for (let i = 0, len = hooks.length; i < len; i++) {
    const hook = hooks[i]?.onResponse;
    if (typeof hook !== "function") continue;
    await hook(context);
  }
}

async function runResponseErrorHooks(context) {
  const hooks = runtime?.hooks || [];
  for (let i = 0, len = hooks.length; i < len; i++) {
    const hook = hooks[i]?.onResponseError;
    if (typeof hook !== "function") continue;
    const result = await hook(context);
    if (result) return result;
  }
  return null;
}

async function runErrorHooks(context) {
  const hooks = runtime?.hooks || [];
  for (let i = 0, len = hooks.length; i < len; i++) {
    const hook = hooks[i]?.onError;
    if (typeof hook !== "function") continue;
    await hook(context);
  }
}
