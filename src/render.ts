import { EventData, Package, Perk, PerkValue } from './types/data';
import debounce from './utils/debounce';
import { createElement } from './utils/rendering';

export type DisplayOption = 'responsive' | 'grid' | 'list';

export interface RenderOptions {
  /**
   * If provided, the text-content of the first cell of the perk grid will be
   * set to this text.
   */
  gridTitle?: string | undefined;

  /**
   * Choose one of three options:
   * - "grid": The grid will always be displayed multiple columns.
   * - "list": The grid will be collapsed into a single column of packages. Each
   *   package will have a list (`<ul>`) of its perks displayed within its cell.
   *   NOTE: The grid "list" will still be made up of `<div>` elements with the
   *   `role="grid"` attribute, not a `<ul>` element.
   * - "responsive" (default): The grid will be displayed as a single column on
   *   small screens and multiple columns on large screens. The breakpoint at
   *   which the view is switched from single-column to multi-column format is
   *   the minimum width necessary for the grid element to display all columns
   *   at their specified minimum widths. See {@link RenderOptions.minWidthPerk}
   *   and {@link RenderOptions.minWidthPackage}.
   *   NOTE: These docs assume you are importing the default CSS.
   */
  display?: DisplayOption | undefined;

  /**
   * The minimum width (in pixels) for displaying the Perk header column when
   * the grid is displayed with multiple columns.
   *
   * Defaults to `200` (200px).
   *
   * NOTE: If the `display` option is set to "list", this option will not be
   * used.
   */
  minWidthPerk?: number | undefined;

  /**
   * The minimum width (in pixels) for displaying the Package columns when
   * the grid is displayed with multiple columns.
   *
   * Defaults to `100` (100px).
   *
   * NOTE: If the `display` option is set to "list", this option will not be
   * used.
   */
  minWidthPackage?: number | undefined;
}

/**
 * The values listed here are used as CSS classes. See source link for more
 * information.
 */
export const CLASSES = {
  /** The parent grid element, once loaded with no error */
  grid: 'epg_grid' as const,
  /**
   * If the grid element has this class, the element should be displayed as a
   * grid rather than as a list.
   */
  displayAsGrid: 'epg_display-as-grid' as const,
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
  /** Lists of perks within the package header elements */
  packagePerkList: 'epg_package-perk-list' as const,
  /** All Package Name or Perk Description elements */
  descriptor: 'epg_descriptor' as const,
  attributes: {
    /** All Package/Park attribute elements */
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
  parent: Element,
  data: EventData,
  {
    gridTitle = '',
    display = 'responsive',
    minWidthPerk = 200,
    minWidthPackage = 100,
  }: RenderOptions = {}
): HTMLDivElement {
  const columnCount = data.packages.length;

  const minWidthForGrid = minWidthPerk + columnCount * minWidthPackage;

  const grid = createElement(
    'div',
    // Assume grid by default. If the responsive option is enabled, we will
    // check the width before rendering is complete. If the responsive option is
    // not enabled, we will display as a grid by default.
    `${CLASSES.grid} ${display === 'list' ? '' : CLASSES.displayAsGrid}`,
    { role: 'grid' }
  );
  grid.setAttribute(
    'style',
    `
    --column-count: ${columnCount};
    --min-width-perk: ${minWidthPerk}px;
    --min-width-package: ${minWidthPackage}px;
    --max-width-perk: ${minWidthPerk / minWidthForGrid}fr;
    --max-width-package: ${minWidthPackage / minWidthForGrid}fr;
    `
  );

  if (display === 'responsive') {
    makeResponsive(grid, minWidthForGrid);
  }

  grid.append(header(gridTitle, data, display));

  if (display === 'responsive' || display === 'grid') {
    grid.append(body(data), footer(data));
  }

  parent.replaceChildren(grid);

  return grid;
}

function makeResponsive(grid: HTMLDivElement, minWidthForGrid: number) {
  const resizeObserver = new ResizeObserver(
    debounce((entries: ResizeObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width > minWidthForGrid) {
          entry.target.classList.add(CLASSES.displayAsGrid);
        } else {
          grid.classList.remove(CLASSES.displayAsGrid);
        }
        // Private event for testing
        grid.dispatchEvent(new CustomEvent('resized'));
      });
    }, 300)
  );

  resizeObserver.observe(grid);

  const mutationObserver = new MutationObserver(() => {
    if (!document.body.contains(grid)) {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    }
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function header(gridTitle: string, data: EventData, display: DisplayOption) {
  const el = createElement('div', `${CLASSES.rowgroup} ${CLASSES.header}`, {
    role: 'rowgroup',
  });

  const headerRow = createElement('div', CLASSES.row, { role: 'row' });

  const title = createElement(
    'div',
    `${CLASSES.cell} ${CLASSES.columnheader}`,
    {
      role: 'columnheader',
      textContent: gridTitle,
    }
  );

  headerRow.append(
    title,
    ...data.packages.map((pkg) => packageHeader(pkg, display))
  );
  el.append(headerRow);

  return el;
}

function packageHeader(pkg: Package, display: DisplayOption) {
  const el = createElement(
    'div',
    `${CLASSES.cell} ${CLASSES.columnheader} ${CLASSES.package}`,
    { role: 'columnheader' }
  );

  const name = createElement('div', CLASSES.descriptor, {
    textContent: pkg.name,
  });

  el.append(name, attributes(pkg));

  if (display !== 'grid') {
    el.append(perkList(pkg));
  }

  return el;
}

function perkList(pkg: Package) {
  const el = createElement('ul', CLASSES.packagePerkList);

  el.append(
    ...pkg.perks.map((perk) => {
      const perkEl = createElement('li', `${CLASSES.perk}`);

      const description = createElement('div', CLASSES.descriptor, {
        textContent: perk.description,
      });

      perkEl.append(description, attributes(perk));

      return perkEl;
    })
  );

  return el;
}

function body(data: EventData) {
  const el = createElement('div', `${CLASSES.rowgroup} ${CLASSES.body}`, {
    role: 'rowgroup',
  });

  el.append(...data.perks.map((perk) => perkRow(perk, data.packages)));

  return el;
}

function perkRow(perk: Perk, packages: Package[]) {
  const el = createElement('div', CLASSES.row, { role: 'row' });

  const rowHeader = createElement(
    'div',
    `${CLASSES.cell} ${CLASSES.rowheader} ${CLASSES.perk}`,
    { role: 'rowheader' }
  );

  const description = createElement('div', CLASSES.descriptor, {
    textContent: perk.description,
  });

  rowHeader.append(description, attributes(perk));
  el.append(rowHeader, ...packages.map((pkg) => perkValue(perk, pkg)));

  return el;
}

function attributes(item: Perk | Package) {
  const el = createElement('div', CLASSES.attributes.container);
  if (item.soldOut) {
    el.classList.add(CLASSES.attributes.soldOut);
    el.textContent = 'Sold out';
  } else if (item.limited) {
    el.classList.add(CLASSES.attributes.limited);
    el.textContent = 'Limited quantities';
  }

  return el;
}

function perkValue(perk: Perk, pkg: Package) {
  const value = pkg.perks.find(
    (perkWithValue) => perkWithValue.id === perk.id
  )?.value;

  const el = createElement(
    'div',
    `${CLASSES.cell} ${CLASSES.perk} ${CLASSES.perkValue(perk, value)}`,
    { role: 'gridcell' }
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
  const el = createElement('div', `${CLASSES.rowgroup} ${CLASSES.footer}`, {
    role: 'rowgroup',
  });

  const footerRow = createElement('div', CLASSES.row, { role: 'row' });

  const footerHeader = createElement(
    'div',
    `${CLASSES.cell} ${CLASSES.rowheader}`,
    { role: 'rowheader' }
  );
  footerHeader.setAttribute('aria-label', 'Package price');

  footerRow.append(
    footerHeader,
    ...data.packages.map((pkg) => packageFooter(pkg))
  );
  el.append(footerRow);

  return el;
}

function packageFooter(pkg: Package) {
  return createElement('div', `${CLASSES.cell} ${CLASSES.package}`, {
    role: 'gridcell',
    textContent: pkg.price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  });
}
