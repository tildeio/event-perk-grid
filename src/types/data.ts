import { inspect } from '../utils/inspect';
import { assertType, isRecord } from './utils';

const PERK_TYPES = [
  'simple' as const,
  'quantity' as const,
  'freeform' as const,
];

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

export type Perk = {
  id: string;
  description: string;
  type: PerkType;
  limited: boolean;
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

export type PerkWithValue = Perk & { value: PerkValue };

export function assertIsPerkWithValue(
  item: unknown
): asserts item is PerkWithValue {
  assertIsPerk(item);

  const { value } = item as Record<string, unknown>;

  assertsIsPerkValue(value);
}

export type Package = {
  id: string;
  name: string;
  price: number;
  limited: boolean;
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

export type EventData = {
  id: string;
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
