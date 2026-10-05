import { clsx, type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export function enumValues<T extends Record<string, string>>(e: T): T[keyof T][] {
  return Object.values(e) as T[keyof T][];
}
