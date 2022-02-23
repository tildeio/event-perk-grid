import { EventData, Package, Perk, PerkValue } from './types/data';
import { div } from './utils/rendering';

export interface RenderOptions {
  /**
   * If provided, the text-content of the first cell of the perk grid will be
   * set to this text.
   */
  gridTitle?: string | undefined;
}

/**
 * The values listed here are used as CSS classes. See source link for more
 * information.
 */
export const CLASSES = {
  /** The parent grid element, once loaded with no error */
  grid: 'epg_grid' as const,
  /** The grid header rowgroup element */
  header: 'epg_header' as const,
  /** The grid body rowgroup element */
  body: 'epg_body' as const,
  /** The grid footer rowgroup element */
  footer: 'epg_footer' as const,
  /** All rowgroup elements */
  rowgroup: 'epg_rowgroup' as const,
  /** All row elements */
  row: 'epg_row' as const,
  /** All columnheader elements */
  columnheader: 'epg_columnheader' as const,
  /** All rowheader elements */
  rowheader: 'epg_rowheader' as const,
  /** All gridcell, columnheader, and rowheader elements */
  cell: 'epg_cell' as const,
  /** All gridcell and columnheader elements related to a Package */
  package: 'epg_package' as const,
  /** All gridcell and rowheader elements related to a Perk */
  perk: 'epg_perk' as const,
  /** All Package Name or Perk Description elements */
  descriptor: 'epg_descriptor' as const,
  attributes: {
    /** All Package/Park attribute container elements */
    container: 'epg_attributes' as const,
    /** All Package/Park "sold-out" attribute elements */
    soldOut: 'epg_attributes-sold-out' as const,
    /** All Package/Park "limited" attribute elements */
    limited: 'epg_attributes-limited' as const,
  },
  /**
   * @param perk
   * @param value A {@link PerkValue} or undefined. If undefined, the value is falsy.
   * @returns A string of classes for selecting a perk value.
   *
   * @example
   * ```js
   * CLASSES.perkValue(mySimplePerk, false);
   * #=> 'epg_perk-value epg_perk-value-simple epg_perk-value-falsy'
   *
   * CLASSES.perkValue(myQuantityPerk, 1);
   * #=> 'epg_perk-value epg_perk-value-quantity epg_perk-value-truthy'
   *
   * CLASSES.perkValue(myFreeformPerk, undefined);
   * #=> 'epg_perk-value epg_perk-value-freeform epg_perk-value-falsy'
   * ```
   */
  perkValue(perk: Perk, value: PerkValue | undefined): string {
    return `epg_perk-value epg_perk-value-${perk.type} epg_perk-value-${
      value ? 'truthy' : 'falsy'
    }`;
  },
};

/**
 * Replaces the contents of the given parent element with an html grid of event
 * sponsorship packages and perks.
 */
export function render(
  parent: Element | DocumentFragment,
  data: EventData,
  { gridTitle = '' }: RenderOptions = {}
): void {
  const grid = div(CLASSES.grid, { role: 'grid' });
  grid.setAttribute('style', `--epg-column-count: ${data.packages.length}`);

  grid.append(header(gridTitle, data), body(data), footer(data));

  parent.replaceChildren(grid);
}

function header(gridTitle: string, data: EventData) {
  const el = div(`${CLASSES.rowgroup} ${CLASSES.header}`, { role: 'rowgroup' });

  const headerRow = div(CLASSES.row, { role: 'row' });

  const title = div(`${CLASSES.cell} ${CLASSES.columnheader}`, {
    role: 'columnheader',
    textContent: gridTitle,
  });

  headerRow.append(title, ...data.packages.map((pkg) => packageHeader(pkg)));
  el.append(headerRow);

  return el;
}

function packageHeader(pkg: Package): HTMLDivElement {
  const el = div(`${CLASSES.cell} ${CLASSES.columnheader} ${CLASSES.package}`, {
    role: 'columnheader',
  });

  const name = div(CLASSES.descriptor, { textContent: pkg.name });

  const attributes = div(CLASSES.attributes.container);
  if (pkg.soldOut) {
    attributes.classList.add(CLASSES.attributes.soldOut);
    attributes.textContent = 'Sold out';
  } else if (pkg.limited) {
    attributes.classList.add(CLASSES.attributes.limited);
    attributes.textContent = 'Limited quantities';
  }

  el.append(name, attributes);

  return el;
}

function body(data: EventData) {
  const el = div(`${CLASSES.rowgroup} ${CLASSES.body}`, { role: 'rowgroup' });

  el.append(...data.perks.map((perk) => perkRow(perk, data.packages)));

  return el;
}

function perkRow(perk: Perk, packages: Package[]): HTMLDivElement {
  const el = div(CLASSES.row, { role: 'row' });

  const rowHeader = div(
    `${CLASSES.cell} ${CLASSES.rowheader} ${CLASSES.perk}`,
    { role: 'rowheader' }
  );

  const description = div(CLASSES.descriptor, {
    textContent: perk.description,
  });

  const attributes = div(CLASSES.attributes.container);
  if (perk.soldOut) {
    attributes.classList.add(CLASSES.attributes.soldOut);
    attributes.textContent = 'Sold out';
  } else if (perk.limited) {
    attributes.classList.add(CLASSES.attributes.limited);
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
    `${CLASSES.cell} ${CLASSES.perk} ${CLASSES.perkValue(perk, value)}`,
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
  const el = div(`${CLASSES.rowgroup} ${CLASSES.footer}`, { role: 'rowgroup' });

  const footerRow = div(CLASSES.row, { role: 'row' });

  const footerHeader = div(`${CLASSES.cell} ${CLASSES.rowheader}`, {
    role: 'rowheader',
  });
  footerHeader.setAttribute('aria-label', 'Package price');

  footerRow.append(
    footerHeader,
    ...data.packages.map((pkg) => packageFooter(pkg))
  );
  el.append(footerRow);

  return el;
}

function packageFooter(pkg: Package): HTMLDivElement {
  return div(`${CLASSES.cell} ${CLASSES.package}`, {
    role: 'gridcell',
    textContent: pkg.price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  });
}
