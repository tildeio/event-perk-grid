import { EventData, Package, Perk } from './types/data';

const styles = `
.epg_grid {
  display: grid;
  box-sizing: border-box;
  grid-template-columns: 2fr repeat(3, 1fr);
}

.epg_rowgroup,
.epg_row {
  display: contents;
}

.epg_cell {
  border: 1px solid black;
}
`;

export default function render(
  shadow: ShadowRoot,
  data: EventData,
  includeStyles = false,
  gridTitle: string | null = null
): void {
  const grid = div('epg_grid', { role: 'grid' });

  const header = div('epg_header epg_rowgroup', { role: 'rowgroup' });
  grid.append(header);

  const headerRow = div('epg_row', { role: 'row' });
  header.append(headerRow);

  const title = div('epg_cell epg_columnheader', {
    role: 'columnheader',
    textContent: gridTitle ?? '',
  });
  headerRow.append(title);

  headerRow.append(...data.packages.map((pkg) => packageHeader(pkg)));

  const body = div('epg_body epg_rowgroup', { role: 'rowgroup' });
  grid.append(body);

  body.append(...data.perks.map((perk) => perkRow(perk, data.packages)));

  shadow.replaceChildren(grid);

  if (includeStyles) {
    const style = document.createElement('style');
    style.textContent = styles;
    shadow.prepend(style);
  }
}

type DivOptions = Partial<{
  role: string;
  textContent: string;
}>;

function div(
  className: string,
  { role, textContent }: DivOptions = {}
): HTMLDivElement {
  const element = document.createElement('div');

  if (role) {
    element.setAttribute('role', role);
  }
  element.setAttribute('class', className);

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

function packageHeader(pkg: Package): HTMLDivElement {
  const header = div('epg_cell epg_columnheader epg_package', {
    role: 'columnheader',
  });

  const name = div('epg_package-name', { textContent: pkg.name });

  const price = div('epg_package-price', {
    textContent: pkg.price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  });

  const attributes = div('epg_package-attributes');
  if (pkg.soldOut) {
    attributes.classList.add('epg_package-sold-out');
    attributes.textContent = 'Sold out';
  } else if (pkg.limited) {
    attributes.classList.add('epg_package-limited');
    attributes.textContent = 'Limited quantities';
  }

  header.append(name, price, attributes);
  return header;
}

function perkRow(perk: Perk, packages: Package[]): HTMLDivElement {
  const row = div('epg_row', { role: 'row' });

  const header = div('epg_cell epg_rowheader', { role: 'rowheader' });

  const description = div('epg_perk-description', {
    textContent: perk.description,
  });

  const attributes = div('epg_perk-attributes');
  if (perk.soldOut) {
    attributes.classList.add('epg_perk-sold-out');
    attributes.textContent = 'Sold out';
  } else if (perk.limited) {
    attributes.classList.add('epg_perk-limited');
    attributes.textContent = 'Limited quantities';
  }

  header.append(description, attributes);

  row.append(header);
  row.append(...packages.map((pkg) => perkValue(perk, pkg)));

  return row;
}

function perkValue(perk: Perk, pkg: Package): HTMLDivElement {
  const value = pkg.perks.find(
    (perkWithValue) => perkWithValue.id === perk.id
  )?.value;

  const cell = div(
    `epg_cell epg_perk-value epg_perk-value-${perk.type} epg_perk-value-${
      value ? 'truthy' : 'falsy'
    }`,
    {
      role: 'gridcell',
    }
  );

  let textContent = '\u2715'; // x

  switch (perk.type) {
    case 'simple':
      if (value) {
        textContent = '\u2713'; // check
      }
      break;
    case 'quantity':
    case 'freeform':
      if (value) {
        textContent = value.toString();
      }
      break;
    // no default
  }

  cell.textContent = textContent;

  return cell;
}
