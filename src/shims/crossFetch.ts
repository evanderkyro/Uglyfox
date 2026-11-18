const nativeFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => globalThis.fetch(input, init);

export const fetch = nativeFetch;
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;

export default nativeFetch;
