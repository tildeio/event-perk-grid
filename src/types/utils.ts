export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertType(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new TypeError(message);
  }
}
