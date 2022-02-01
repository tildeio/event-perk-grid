import { EventData } from './types/data';

export default class Fetcher {
  constructor(private eventId: string) {}

  fetch(): Promise<EventData> {
    console.info('fetching data for', this.eventId);
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            id: '8c6a2f80-4ffe-4635-9b2a-e2fa06540fd2',
            name: 'EmberConf',
            packages: [
              {
                id: '3c7d5844-8607-4967-8b04-3a0f831b2b06',
                name: 'Silver',
                price: 24,
                limited: true,
                soldOut: true,
                perks: [
                  {
                    id: '5dd7b830-6aa6-40ad-977a-f23c9acfc3e7',
                    description: 'Blurb on emberconf.com',
                    type: 'quantity',
                    limited: true,
                    soldOut: true,
                    value: 1,
                  },
                  {
                    id: '6b6d2ae1-caef-49ac-bda2-4bca46279cca',
                    description: 'Logo on screens during breaks',
                    type: 'freeform',
                    limited: true,
                    soldOut: false,
                    value: 'Included',
                  },
                  {
                    id: '21c155d2-638e-419f-ab36-ea7dafdbda52',
                    description: 'Opportunities for promo videos',
                    type: 'simple',
                    limited: true,
                    soldOut: true,
                    value: true,
                  },
                ],
              },
              {
                id: '83e3c65e-3888-4883-9595-eea174e82a29',
                name: 'Gold',
                price: 40,
                limited: true,
                soldOut: true,
                perks: [
                  {
                    id: '5dd7b830-6aa6-40ad-977a-f23c9acfc3e7',
                    description: 'Blurb on emberconf.com',
                    type: 'quantity',
                    limited: true,
                    soldOut: true,
                    value: 1,
                  },
                  {
                    id: '6b6d2ae1-caef-49ac-bda2-4bca46279cca',
                    description: 'Logo on screens during breaks',
                    type: 'freeform',
                    limited: true,
                    soldOut: false,
                    value: 'Included',
                  },
                  {
                    id: '21c155d2-638e-419f-ab36-ea7dafdbda52',
                    description: 'Opportunities for promo videos',
                    type: 'simple',
                    limited: true,
                    soldOut: true,
                    value: true,
                  },
                ],
              },
              {
                id: '1f8cb4c2-9d36-42ab-b51a-52c8c29c0bdf',
                name: 'Diamond',
                price: 42,
                limited: true,
                soldOut: true,
                perks: [
                  {
                    id: '6b6d2ae1-caef-49ac-bda2-4bca46279cca',
                    description: 'Logo on screens during breaks',
                    type: 'freeform',
                    limited: true,
                    soldOut: false,
                    value: 'Included',
                  },
                  {
                    id: '21c155d2-638e-419f-ab36-ea7dafdbda52',
                    description: 'Opportunities for promo videos',
                    type: 'simple',
                    limited: true,
                    soldOut: true,
                    value: true,
                  },
                ],
              },
            ],
            perks: [
              {
                id: '5dd7b830-6aa6-40ad-977a-f23c9acfc3e7',
                description: 'Blurb on emberconf.com',
                type: 'quantity',
                limited: true,
                soldOut: true,
              },
              {
                id: '6b6d2ae1-caef-49ac-bda2-4bca46279cca',
                description: 'Logo on screens during breaks',
                type: 'freeform',
                limited: true,
                soldOut: false,
              },
              {
                id: '21c155d2-638e-419f-ab36-ea7dafdbda52',
                description: 'Opportunities for promo videos',
                type: 'simple',
                limited: true,
                soldOut: true,
              },
            ],
          }),
        200
      );
    });
  }
}
