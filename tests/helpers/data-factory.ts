import { EventData, Package, Perk, PerkWithValue } from '../../src/types/data';

interface Factory<T> {
  create(attributes?: Partial<T>): T;
}

class Counter {
  private i = 0;

  getCount(): number {
    const { i } = this;
    this.i += 1;
    return i;
  }
}

class WithCounter {
  private counter = new Counter();

  private _i: number | null = null;

  get i(): number {
    if (this._i === null) {
      this._i = this.counter.getCount();
    }
    return this._i;
  }
}

class PerkFactory extends WithCounter implements Factory<Perk> {
  create({ id, description }: Partial<Perk> = {}): Perk {
    return {
      id: id ?? `perk-${this.i}`,
      description: description ?? `Perk description ${this.i}`,
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
    return {
      id: attributes.id ?? `package-${this.i}`,
      name: attributes.name ?? `Package ${this.i}`,
      price: attributes.price ?? this.i * 1000,
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
      id: attributes.id ?? `event-${this.i}`,
      name: attributes.name ?? `Event ${this.i}`,
      packages,
      perks,
    };
  }
}

export const EVENT_DATA_FACTORY = new EventDataFactory();
