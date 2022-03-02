import { CLASSES } from '../css-classes';
import { EventData, Package, Perk } from '../types/data';
import { createElement } from '../utils/rendering';
import { DisplayOption } from './types';

export function header(
  gridTitle: string,
  data: EventData,
  display: DisplayOption
): HTMLDivElement {
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

export function body(data: EventData): HTMLDivElement {
  const el = createElement('div', `${CLASSES.rowgroup} ${CLASSES.body}`, {
    role: 'rowgroup',
  });

  el.append(...data.perks.map((perk) => perkRow(perk, data.packages)));

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
  footerHeader.setAttribute('aria-label', 'Package price');

  footerRow.append(
    footerHeader,
    ...data.packages.map((pkg) => packageFooter(pkg))
  );
  el.append(footerRow);

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
