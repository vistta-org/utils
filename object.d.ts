export function isObject(object: object): boolean;

export function isObjectEmpty(object: object): boolean;

export function stringify(object: object, formatted?: boolean): string;

export function parse(object: string, secure?: boolean): object;

export function clone(object: object, json?: boolean): object;

export function copyPropertyDescriptors(object: object, target: object): object;

export function flatten(
  object: object,
  separator: string,
  transformer: (value: string) => string,
): object;
