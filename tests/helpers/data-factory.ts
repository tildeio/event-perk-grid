import { EventData, Package, Perk, PerkWithValue } from '../../src/types/data';

interface Factory<T> {
  create(attributes?: Partial<T>): T;
}

class WithCounter {
  private _i = 0;

  getCount(): number {
    this._i += 1;
    return this._i;
  }
}

class PerkFactory extends WithCounter implements Factory<Perk> {
  create({ id, description }: Partial<Perk> = {}): Perk {
    const i = this.getCount();
    return {
      id: id ?? `perk-${i}`,
      description: description ?? `Perk description ${i}`,
      type: 'simple',
      limited: false,
      soldOut: false,
    };
  }
}

export const PERK_FACTORY = new PerkFactory();

const DEFAULT_VALUES = {
  simple: true,
  quantity: 1,
  freeform: 'Included',
};

export class PerkWithValueFactory
  extends WithCounter
  implements Factory<PerkWithValue>
{
  create({
    value,
    ...perkAttributes
  }: Partial<PerkWithValue> = {}): PerkWithValue {
    const perk = PERK_FACTORY.create(perkAttributes);

    return {
      ...perk,
      value: value ?? DEFAULT_VALUES[perk.type],
    };
  }
}

export const PERK_WITH_VALUE_FACTORY = new PerkWithValueFactory();

class PackageFactory extends WithCounter implements Factory<Package> {
  create(attributes: Partial<Package> = {}): Package {
    const i = this.getCount();
    return {
      id: attributes.id ?? `package-${i}`,
      name: attributes.name ?? `Package ${i}`,
      price: attributes.price ?? i * 1000,
      limited: attributes.limited ?? false,
      soldOut: attributes.soldOut ?? false,
      perks: attributes.perks ?? [PERK_WITH_VALUE_FACTORY.create()],
    };
  }
}

export const PACKAGE_FACTORY = new PackageFactory();

type EventDataFactoryBaseAttributes = Partial<
  Omit<EventData, 'packages' | 'perks'>
>;
type EventDataFactoryAttributes =
  | EventDataFactoryBaseAttributes
  | (EventDataFactoryBaseAttributes & Pick<EventData, 'packages' | 'perks'>);

class EventDataFactory extends WithCounter implements Factory<EventData> {
  create(attributes: EventDataFactoryAttributes = {}): EventData {
    const i = this.getCount();

    const maybePackages =
      'packages' in attributes ? attributes.packages : undefined;
    const maybePerks = 'perks' in attributes ? attributes.perks : undefined;

    const perksWithValues =
      maybePerks === undefined
        ? [PERK_WITH_VALUE_FACTORY.create()]
        : maybePerks.map((p) => PERK_WITH_VALUE_FACTORY.create(p));

    const perks =
      maybePerks === undefined
        ? perksWithValues.map((p) => PERK_FACTORY.create(p))
        : maybePerks;

    const packages =
      maybePackages === undefined
        ? [PACKAGE_FACTORY.create({ perks: perksWithValues })]
        : maybePackages;

    return {
      id: attributes.id ?? `event-${i}`,
      name: attributes.name ?? `Event ${i}`,
      packages,
      perks,
    };
  }
}

export const EVENT_DATA_FACTORY = new EventDataFactory();

export function makeEventData(): EventData {
  const perks = ['Good', 'Better', 'Best'].map((description) =>
    PERK_FACTORY.create({ description })
  );
  const packages = [
    { name: 'Gold', price: 3000 },
    { name: 'Silver', price: 2000 },
    { name: 'Bronze', price: 1000 },
  ].map((attributes, i) =>
    PACKAGE_FACTORY.create({
      ...attributes,
      perks: perks
        .slice(0, perks.length - i)
        .map((p) => PERK_WITH_VALUE_FACTORY.create(p)),
    })
  );
  return EVENT_DATA_FACTORY.create({
    name: 'My Event',
    perks,
    packages,
  });
}
