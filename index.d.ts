export function isEqual(a: any, b: any): boolean;

export function isPromise(target: any): boolean;

export function isAsync(target: any): boolean;

export function setImmediate(callback: () => void): void;

export function sleep(milliseconds: number): Promise<void>;

export * from "./object";
export * from "./string";
