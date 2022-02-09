export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export class PerkGridTypeError extends TypeError {
  override name = 'PerkGridTypeError';
}

export function assertType(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new PerkGridTypeError(message);
  }
}

export function assertExists<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error('Expected value to exist');
  }

  return value;
}
