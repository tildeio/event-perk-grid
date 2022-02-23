import { inspect } from '../utils/inspect';
import { assertType, isRecord } from './utils';

/**
 * @see {@link PerkType}
 */
export const PERK_TYPES = [
  'simple' as const,
  'quantity' as const,
  'freeform' as const,
];

/**
 * The type of perk. One of:
 * - "simple": a boolean perk
 * - "quantity": a quantifiable perk
 * - "freeform": a custom perk type
 */
export type PerkType = typeof PERK_TYPES[number];

export function assertIsPerkType(item: unknown): asserts item is PerkType {
  assertType(
    typeof item === 'string',
    `Expected type to be a string, not ${inspect(item)}`
  );

  assertType(
    PERK_TYPES.includes(item as PerkType),
    `Expected type to be one of ${inspect(PERK_TYPES)}, not ${inspect(item)}`
  );
}

/**
 * Data for an Event Perk. Perks in draft state will not be included.
 */
export type Perk = {
  /** Perk ID */
  id: string;
  /** Perk description */
  description: string;
  type: PerkType;
  /** If true, the perk is available only in limited quantities. */
  limited: boolean;
  /**
   * If true, the perk is available only in limited quantities AND is sold out.
   */
  soldOut: boolean;
};

export function assertIsPerk(item: unknown): asserts item is Perk {
  assertType(
    isRecord(item),
    `Expected perk to be an object, not ${inspect(item)}`
  );

  const { description, type, limited, soldOut } = item;

  assertType(
    typeof description === 'string',
    `Expected perk.description to be a string, not ${inspect(description)}`
  );

  assertIsPerkType(type);

  assertType(
    typeof limited === 'boolean',
    `Expected perk.limited to be a boolean, not ${inspect(limited)}`
  );

  assertType(
    typeof soldOut === 'boolean',
    `Expected perk.soldOut to be a boolean, not ${inspect(soldOut)}`
  );
}

/**
 * The value for the {@link Perk} for the {@link Package}.
 * The type depends on the PerkType:
 * - "simple": boolean
 * - "quantity": number | 'all'
 * - "freeform": string
 */
export type PerkValue = number | string | boolean;

export function assertsIsPerkValue(item: unknown): asserts item is PerkValue {
  if (typeof item === 'number') {
    assertType(
      Number.isSafeInteger(item),
      `Expected perk value to be a valid number, not ${item}`
    );
  } else {
    assertType(
      ['string', 'boolean'].includes(typeof item),
      `Expected perk value to be a number, string, or boolean value, not ${inspect(
        item
      )}`
    );
  }
}

/**
 * For convenience, Perks are listed at both the top level and underneath the
 * relevant packages. When listed under their packages, the Perk object includes
 * the {@link PerkValue}.
 */
export type PerkWithValue = Perk & { value: PerkValue };

export function assertIsPerkWithValue(
  item: unknown
): asserts item is PerkWithValue {
  assertIsPerk(item);

  const { value } = item as Record<string, unknown>;

  assertsIsPerkValue(value);
}

/**
 * Data for an Event Package. Packages in draft state will not be included.
 */
export type Package = {
  /** Package ID */
  id: string;
  /** Package name */
  name: string;
  /** Integer price of the package */
  price: number;
  /** If true, the package is available only in limited quantities. */
  limited: boolean;
  /**
   * If true, the package is available only in limited quantities AND is sold
   * out.
   */
  soldOut: boolean;
  perks: PerkWithValue[];
};

export function assertIsPackage(item: unknown): asserts item is Package {
  assertType(
    isRecord(item),
    `Expected package to be an object, not ${inspect(item)}`
  );

  const { name, price, limited, soldOut, perks } = item;

  assertType(
    typeof name === 'string',
    `Expected package.name to be a string, not ${inspect(name)}`
  );

  assertType(
    typeof price === 'number' && Number.isSafeInteger(price),
    `Expected package.price to be a valid number, not ${inspect(price)}`
  );

  assertType(
    typeof limited === 'boolean',
    `Expected package.limited to be a boolean, not ${inspect(limited)}`
  );

  assertType(
    typeof soldOut === 'boolean',
    `Expected package.soldOut to be a boolean, not ${inspect(soldOut)}`
  );

  assertType(
    Array.isArray(perks),
    `Expected package.perks to be an array, not ${inspect(perks)}`
  );

  perks.forEach((p) => assertIsPerk(p));
}

/**
 * Data for an event perk grid.
 */
export type EventData = {
  /** Event ID */
  id: string;
  /** Event name */
  name: string;
  packages: Package[];
  perks: Perk[];
};

export function assertIsEventData(item: unknown): asserts item is EventData {
  assertType(
    isRecord(item),
    `Expected event to be an object, not ${inspect(item)}`
  );

  const { name, packages, perks } = item;

  assertType(
    typeof name === 'string',
    `Expected event.name to be a string, not ${inspect(name)}`
  );

  assertType(
    Array.isArray(packages),
    `Expected event.packages to be an array, not ${inspect(packages)}`
  );

  packages.forEach((p) => assertIsPackage(p));

  assertType(
    Array.isArray(perks),
    `Expected event.perks to be an array, not ${inspect(perks)}`
  );

  perks.forEach((p) => assertIsPerk(p));
}
