import { CLASSES } from '../css-classes';
import { EventData, Package, Perk } from '../types/data';
import { createElement } from '../utils/dom';

type DisplayOption = 'responsive' | 'grid' | 'list';

type NodeOptions = {
  display: DisplayOption;
  limitedText: string;
  soldOutText: string;
};

export function header(
  gridTitle: string,
  data: EventData,
  options: NodeOptions
): HTMLDivElement {
  const el = createElement('div', `${CLASSES.rowgroup} ${CLASSES.header}`, {
    role: 'rowgroup',
  });

  const headerRow = createElement('div', CLASSES.row, { role: 'row' });

  const titleContainer = createElement(
    'div',
    `${CLASSES.cell} ${CLASSES.columnheader} ${CLASSES.title}`,
    { role: 'columnheader' }
  );

  if (gridTitle) {
    const title = createElement('h1', CLASSES.caption, {
      textContent: gridTitle,
    });
    titleContainer.append(title);
  }

  headerRow.append(
    titleContainer,
    ...data.packages.map((pkg) => packageHeader(pkg, options))
  );
  el.append(headerRow);

  return el;
}

export function body(data: EventData, options: NodeOptions): HTMLDivElement {
  const el = createElement('div', `${CLASSES.rowgroup} ${CLASSES.body}`, {
    role: 'rowgroup',
  });

  el.append(...data.perks.map((perk) => perkRow(perk, data.packages, options)));

  return el;
}

export function footer(data: EventData): HTMLDivElement {
  const el = createElement('div', `${CLASSES.rowgroup} ${CLASSES.footer}`, {
    role: 'rowgroup',
  });

  const footerRow = createElement('div', CLASSES.row, { role: 'row' });

  const footerHeader = createElement(
    'div',
    `${CLASSES.cell} ${CLASSES.rowheader}`,
    { role: 'rowheader' }
  );
  footerHeader.ariaLabel = 'Package price';

  footerRow.append(
    footerHeader,
    ...data.packages.map((pkg) => packageFooter(pkg))
  );
  el.append(footerRow);

  return el;
}

function packageHeader(pkg: Package, options: NodeOptions) {
  const el = createElement(
    'div',
    `${CLASSES.cell} ${CLASSES.columnheader} ${CLASSES.package}`,
    { role: 'columnheader' }
  );
  el.ariaLabel = 'Package';

  const name = createElement('div', CLASSES.descriptor, {
    textContent: pkg.name,
  });

  el.append(name);
  maybeAppendAttributes(el, pkg, options);

  if (options.display !== 'grid') {
    el.append(perkList(pkg, options));
    el.append(packagePrice(pkg));
  }

  return el;
}

function perkList(pkg: Package, options: NodeOptions) {
  const el = createElement('ul', CLASSES.packagePerkList);

  el.append(
    ...pkg.perks.map((perk) => {
      const perkEl = createElement('li', `${CLASSES.perk}`);

      const description = createElement('div', CLASSES.descriptor, {
        textContent: perk.description,
      });

      perkEl.append(description);
      maybeAppendAttributes(perkEl, perk, options);

      return perkEl;
    })
  );

  return el;
}

function perkRow(perk: Perk, packages: Package[], options: NodeOptions) {
  const el = createElement('div', CLASSES.row, { role: 'row' });

  const rowHeader = createElement(
    'div',
    `${CLASSES.cell} ${CLASSES.rowheader} ${CLASSES.perk}`,
    { role: 'rowheader' }
  );
  rowHeader.ariaLabel = 'Perk';

  const description = createElement('div', CLASSES.descriptor, {
    textContent: perk.description,
  });

  rowHeader.append(description);
  maybeAppendAttributes(rowHeader, perk, options);
  el.append(rowHeader, ...packages.map((pkg) => perkValue(perk, pkg)));

  return el;
}

function maybeAppendAttributes(
  parent: HTMLElement,
  item: Perk | Package,
  { limitedText, soldOutText }: NodeOptions
) {
  if (item.soldOut || item.limited) {
    const el = createElement('div', CLASSES.attributes.container);
    if (item.soldOut) {
      el.classList.add(CLASSES.attributes.soldOut);
      el.textContent = soldOutText;
    } else if (item.limited) {
      el.classList.add(CLASSES.attributes.limited);
      el.textContent = limitedText;
    }
    parent.append(el);
  }
}

function perkValue(perk: Perk, pkg: Package) {
  const value = pkg.perks.find(
    (perkWithValue) => perkWithValue.id === perk.id
  )?.value;

  const el = createElement(
    'div',
    `${CLASSES.cell} ${CLASSES.perk} ${CLASSES.packagePerk}`,
    {
      role: 'gridcell',
    }
  );

  const span = createElement('span', CLASSES.perkValue(perk, value));

  let included = false;
  let textContent = '\u2715'; // x

  switch (perk.type) {
    case 'simple':
      if (value) {
        included = true;
        textContent = '\u2713'; // check
        span.ariaLabel = 'included';
        span.setAttribute('role', 'img');
      }
      break;
    case 'quantity':
    case 'freeform':
      if (value) {
        included = true;
        textContent = value.toString();
      }
      break;
    // no default
  }

  if (!included) {
    span.ariaLabel = 'not included';
    span.setAttribute('role', 'img');
  }

  span.textContent = textContent;

  el.append(span);

  return el;
}

function packageFooter(pkg: Package) {
  const el = createElement('div', `${CLASSES.cell} ${CLASSES.package}`, {
    role: 'gridcell',
  });
  el.ariaLabel = 'Package price';
  el.append(packagePrice(pkg));
  return el;
}

function packagePrice(pkg: Package) {
  return createElement('div', CLASSES.price, {
    textContent: pkg.price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  });
}
