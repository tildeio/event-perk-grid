export type PerkType = 'simple' | 'quantity' | 'freeform';

export type Perk = {
  id: string;
  description: string;
  type: PerkType;
  limited: boolean;
  soldOut: boolean;
};

export type PerkValue = number | string | boolean;

export type PerkWithValue = Perk & { value: PerkValue };

export type Package = {
  id: string;
  name: string;
  price: number;
  limited: boolean;
  soldOut: boolean;
  perks: PerkWithValue[];
};

export type EventData = {
  id: string;
  name: string;
  packages: Package[];
  perks: Perk[];
};
