export function nameOf <T>(key: keyof T): string{
  return key as string;
}
