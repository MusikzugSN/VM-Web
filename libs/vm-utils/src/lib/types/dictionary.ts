export interface Dictionary<T> {
  [key: string]: T
}

export function convertToPatch<TResult>(dict: Dictionary<string>): Partial<TResult> {
  return Object.fromEntries(
    Object.entries(dict).filter(([_, v]) => v !== undefined)
  ) as Partial<TResult>;
}
