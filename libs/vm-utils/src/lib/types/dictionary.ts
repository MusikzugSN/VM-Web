export interface Dictionary<T> {
  [key: string]: T;
}

export interface NumDictionary<T> {
  [key: number]: T;
}

export function convertToPatch<TResult, TBase>(dict: Dictionary<TBase>): Partial<TResult> {
  return Object.fromEntries(
    Object.entries(dict).filter(([_, v]) => v !== undefined),
  ) as Partial<TResult>;
}
