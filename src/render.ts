import { EventData, Package, Perk } from './types/data';
import { div } from './utils/rendering';

export interface RenderOptions {
  /**
   * If provided, the text-content of the first cell of the perk grid will be
   * set to this text.
   */
  gridTitle?: string | undefined;
}

/**
 * Replaces the contents of the given parent element with an html grid of event
 * sponsorship packages and perks.
 */
export function render(
  parent: Element | DocumentFragment,
  data: EventData,
  { gridTitle = '' }: RenderOptions = {}
): void {
  const grid = div('epg_grid', { role: 'grid' });
  grid.setAttribute('style', `--epg-column-count: ${data.packages.length}`);

  const header = div('epg_header epg_rowgroup', { role: 'rowgroup' });
  grid.append(header);

  const headerRow = div('epg_row', { role: 'row' });
  header.append(headerRow);

  const title = div('epg_cell epg_columnheader', {
    role: 'columnheader',
    textContent: gridTitle,
  });

  headerRow.append(title, ...data.packages.map((pkg) => packageHeader(pkg)));

  const body = div('epg_body epg_rowgroup', { role: 'rowgroup' });
  grid.append(body);

  body.append(...data.perks.map((perk) => perkRow(perk, data.packages)));

  const footer = div('epg_footer epg_rowgroup', { role: 'rowgroup' });
  grid.append(footer);

  const footerRow = div('epg_row', { role: 'row' });
  footer.append(footerRow);

  const footerHeader = div('epg_cell', { role: 'rowheader' });
  footerHeader.setAttribute('aria-label', 'Package price');
  footerRow.append(
    footerHeader,
    ...data.packages.map((pkg) => packageFooter(pkg))
  );

  parent.replaceChildren(grid);
}

function packageHeader(pkg: Package): HTMLDivElement {
  const header = div('epg_cell epg_columnheader epg_package', {
    role: 'columnheader',
  });

  const name = div('epg_package-name', { textContent: pkg.name });

  const attributes = div('epg_package-attributes');
  if (pkg.soldOut) {
    attributes.classList.add('epg_package-sold-out');
    attributes.textContent = 'Sold out';
  } else if (pkg.limited) {
    attributes.classList.add('epg_package-limited');
    attributes.textContent = 'Limited quantities';
  }

  header.append(name, attributes);
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

function packageFooter(pkg: Package): HTMLDivElement {
  return div('epg_cell epg_package', {
    role: 'gridcell',
    textContent: pkg.price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  });
}
