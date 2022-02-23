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

  grid.append(header(gridTitle, data), body(data), footer(data));

  parent.replaceChildren(grid);
}

function header(gridTitle: string, data: EventData) {
  const el = div('epg_header epg_rowgroup', { role: 'rowgroup' });

  const headerRow = div('epg_row', { role: 'row' });

  const title = div('epg_cell epg_columnheader', {
    role: 'columnheader',
    textContent: gridTitle,
  });

  headerRow.append(title, ...data.packages.map((pkg) => packageHeader(pkg)));
  el.append(headerRow);

  return el;
}

function packageHeader(pkg: Package): HTMLDivElement {
  const el = div('epg_cell epg_columnheader epg_package', {
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

  el.append(name, attributes);

  return el;
}

function body(data: EventData) {
  const el = div('epg_body epg_rowgroup', { role: 'rowgroup' });

  el.append(...data.perks.map((perk) => perkRow(perk, data.packages)));

  return el;
}

function perkRow(perk: Perk, packages: Package[]): HTMLDivElement {
  const el = div('epg_row', { role: 'row' });

  const rowHeader = div('epg_cell epg_rowheader', { role: 'rowheader' });

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

  rowHeader.append(description, attributes);
  el.append(rowHeader, ...packages.map((pkg) => perkValue(perk, pkg)));

  return el;
}

function perkValue(perk: Perk, pkg: Package): HTMLDivElement {
  const value = pkg.perks.find(
    (perkWithValue) => perkWithValue.id === perk.id
  )?.value;

  const el = div(
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

  el.textContent = textContent;

  return el;
}

function footer(data: EventData) {
  const el = div('epg_footer epg_rowgroup', { role: 'rowgroup' });

  const footerRow = div('epg_row', { role: 'row' });

  const footerHeader = div('epg_cell', { role: 'rowheader' });
  footerHeader.setAttribute('aria-label', 'Package price');

  footerRow.append(
    footerHeader,
    ...data.packages.map((pkg) => packageFooter(pkg))
  );
  el.append(footerRow);

  return el;
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
