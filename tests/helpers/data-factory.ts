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
      description: description ?? `Perk ${i}`,
      type: 'simple',
      limited: false,
      soldOut: false,
    };
  }
}

const DEFAULT_VALUES = {
  simple: true,
  quantity: 1,
  freeform: 'Included',
};

class PerkWithValueFactory
  extends WithCounter
  implements Factory<PerkWithValue>
{
  constructor(private perkFactory: PerkFactory) {
    super();
  }

  create({
    value,
    ...perkAttributes
  }: Partial<PerkWithValue> = {}): PerkWithValue {
    const perk = this.perkFactory.create(perkAttributes);

    return {
      ...perk,
      value: value ?? DEFAULT_VALUES[perk.type],
    };
  }
}

class PackageFactory extends WithCounter implements Factory<Package> {
  constructor(private perkWithValueFactory: PerkWithValueFactory) {
    super();
  }

  create(attributes: Partial<Package> = {}): Package {
    const i = this.getCount();
    return {
      id: attributes.id ?? `package-${i}`,
      name: attributes.name ?? `Package ${i}`,
      price: attributes.price ?? i * 1000,
      limited: attributes.limited ?? false,
      soldOut: attributes.soldOut ?? false,
      perks: attributes.perks ?? [this.perkWithValueFactory.create()],
    };
  }
}

type BaseEventDataFactoryAttributes = Partial<
  Omit<EventData, 'packages' | 'perks'>
>;

type EventDataFactoryAttributes = BaseEventDataFactoryAttributes &
  Pick<EventData, 'packages' | 'perks'>;

class EventDataFactory extends WithCounter implements Factory<EventData> {
  create(attributes: EventDataFactoryAttributes): EventData {
    const i = this.getCount();

    return {
      id: attributes.id ?? `event-${i}`,
      name: attributes.name ?? `Event ${i}`,
      packages: attributes.packages,
      perks: attributes.perks,
    };
  }
}

type EventDataParams = {
  packageAttrs?: Array<Partial<Package>>;
  perkAttrs?: Array<Partial<Perk>>;
  pkgCount?: number;
  perkCount?: number;
  eventAttributes?: BaseEventDataFactoryAttributes;
};

export class DataFactory {
  private perkFactory = new PerkFactory();

  private perkWithValueFactory = new PerkWithValueFactory(this.perkFactory);

  private packageFactory = new PackageFactory(this.perkWithValueFactory);

  private eventDataFactory = new EventDataFactory();

  makeEventData({
    pkgCount = 3,
    perkCount = 3,
    packageAttrs = Array.from<Partial<Package>>({ length: pkgCount }).fill({}),
    perkAttrs = Array.from<Partial<Perk>>({ length: perkCount }).fill({}),
    eventAttributes,
  }: EventDataParams = {}): EventData {
    const perks = perkAttrs.map((attrs) => this.perkFactory.create(attrs));
    const packages = packageAttrs.map((attributes, i) =>
      this.packageFactory.create({
        ...attributes,
        perks: perks
          .slice(0, perks.length - i)
          .map((p) => this.perkWithValueFactory.create(p)),
      })
    );
    return this.eventDataFactory.create({
      ...eventAttributes,
      perks,
      packages,
    });
  }
}
