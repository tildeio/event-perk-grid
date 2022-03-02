import { module, test } from 'qunit';
import { CLASSES } from '../src/css-classes';
import { render } from '../src/render';
import { assertExists } from '../src/types/utils';
import { assertGrid } from './helpers/assert-grid';
import { triggerKeyboardEvent } from './helpers/test-helpers';
import { RenderingTestContext, setupRenderingTest } from './test-setup';

type Context = RenderingTestContext;

module('render', function (hooks) {
  setupRenderingTest(hooks);

  test('renders a basic grid', async function (this: Context, assert) {
    const data = this.factory.makeEventData();

    await responsiveRender(this.element, data);

    assertGrid(assert, [
      ['', 'Package 1', 'Package 2', 'Package 3'],
      ['Perk 1', '✓', '✓', '✓'],
      ['Perk 2', '✓', '✓', '✕'],
      ['Perk 3', '✓', '✕', '✕'],
      ['', '$1,000', '$2,000', '$3,000'],
    ]);
  });

  test('can be styled by the user', async function (this: Context, assert) {
    const data = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

    await responsiveRender(this.element, data);

    assertGrid(assert, [
      ['', 'Package 1'],
      ['Perk 1', '✓'],
      ['', '$1,000'],
    ]);

    assert
      .dom('.epg_grid')
      .doesNotHaveStyle(
        { color: 'rgb(1, 2, 3)' },
        'setup: grid element not already styled'
      );

    const style = document.createElement('style');
    style.innerHTML = `.epg_grid { color: rgb(1, 2, 3); }`;
    this.element.prepend(style);
    assert.dom('style').exists('setup: style element added');

    assert.dom('.epg_grid').hasStyle({ color: 'rgb(1, 2, 3)' });
  });

  test('replaces any existing children', async function (this: Context, assert) {
    const placeholder = document.createElement('div');
    placeholder.setAttribute('id', 'replace-me');
    this.element.append(placeholder);

    assert.dom('#replace-me').exists('There is an element to replace');

    const data = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

    await responsiveRender(this.element, data);

    assertGrid(assert, [
      ['', 'Package 1'],
      ['Perk 1', '✓'],
      ['', '$1,000'],
    ]);
    assert.dom('#replace-me').doesNotExist('The element was replaced');
  });

  module('display', function () {
    test('is responsive by default', async function (this: Context, assert) {
      const data = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

      const perkGrid = await responsiveRender(this.element, data);

      assertGrid(assert, [
        ['', 'Package 1'],
        ['Perk 1', '✓'],
        ['', '$1,000'],
      ]);

      await waitForResize(perkGrid, 250);

      assert.dom(perkGrid).doesNotHaveClass('epg_display-as-grid');

      await waitForResize(perkGrid, 400);

      assert.dom(perkGrid).hasClass('epg_display-as-grid');
    });

    test('can be displayed as grid only', function (this: Context, assert) {
      const data = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

      const perkGrid = render(this.element, data, { display: 'grid' });

      assertGrid(assert, [
        ['', 'Package 1'],
        ['Perk 1', '✓'],
        ['', '$1,000'],
      ]);

      assert.dom(perkGrid).hasClass('epg_display-as-grid');

      perkGrid.style.width = '250px';

      assert.dom(perkGrid).hasClass('epg_display-as-grid');

      perkGrid.style.width = '400px';

      assert.dom(perkGrid).hasClass('epg_display-as-grid');
    });

    test('can be displayed as list only', function (this: Context, assert) {
      const data = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

      const perkGrid = render(this.element, data, { display: 'list' });

      assertGrid(assert, [['', 'Package 1 Perk 1']], false);

      assert.dom(perkGrid).doesNotHaveClass('epg_display-as-grid');

      perkGrid.style.width = '250px';

      assert.dom(perkGrid).doesNotHaveClass('epg_display-as-grid');

      perkGrid.style.width = '400px';

      assert.dom(perkGrid).doesNotHaveClass('epg_display-as-grid');
    });
  });

  module('accessibility', function () {
    test('grid display is keyboard navigable', function (this: Context, assert) {
      const data = this.factory.makeEventData({ pkgCount: 3, perkCount: 1 });

      const grid = render(this.element, data, { display: 'grid' });

      assertGrid(assert, [
        ['', 'Package 1', 'Package 2', 'Package 3'],
        ['Perk 1', '✓', '✕', '✕'],
        ['', '$1,000', '$2,000', '$3,000'],
      ]);

      const assertCellIsFocused = makeFocusAssertion(assert, grid);

      gridDisplayIsKeyboardNavigable(this, assertCellIsFocused, grid);
    });

    test('list display is keyboard navigable (empty title cell)', function (this: Context, assert) {
      const data = this.factory.makeEventData({ pkgCount: 3, perkCount: 1 });

      const grid = render(this.element, data, { display: 'list' });

      assertGrid(
        assert,
        [['', 'Package 1 Perk 1', 'Package 2', 'Package 3']],
        false
      );

      const assertCellIsFocused = makeFocusAssertion(assert, grid);

      listDisplayIsKeyboardNavigableNoTitle(this, assertCellIsFocused, grid);
    });

    test('list display is keyboard navigable (with title cell)', function (this: Context, assert) {
      const data = this.factory.makeEventData({ pkgCount: 3, perkCount: 1 });

      const grid = render(this.element, data, {
        display: 'list',
        gridTitle: 'Title',
      });

      assertGrid(
        assert,
        [['Title', 'Package 1 Perk 1', 'Package 2', 'Package 3']],
        false
      );

      const assertCellIsFocused = makeFocusAssertion(assert, grid);

      listDisplayIsKeyboardNavigableWithTitle(this, assertCellIsFocused, grid);
    });

    test('responsive display is keyboard navigable (empty title cell)', async function (this: Context, assert) {
      const data = this.factory.makeEventData({ pkgCount: 3, perkCount: 1 });

      const grid = await responsiveRender(this.element, data);

      assertGrid(assert, [
        ['', 'Package 1', 'Package 2', 'Package 3'],
        ['Perk 1', '✓', '✕', '✕'],
        ['', '$1,000', '$2,000', '$3,000'],
      ]);

      const assertCellIsFocused = makeFocusAssertion(assert, grid);

      await waitForResize(grid, 250);

      assert.dom(grid).doesNotHaveClass('epg_display-as-grid');
      listDisplayIsKeyboardNavigableNoTitle(this, assertCellIsFocused, grid);

      await waitForResize(grid, 600);

      assert.dom(grid).hasClass('epg_display-as-grid');
      gridDisplayIsKeyboardNavigable(this, assertCellIsFocused, grid);
    });

    test('responsive display is keyboard navigable (with title cell)', async function (this: Context, assert) {
      const data = this.factory.makeEventData({ pkgCount: 3, perkCount: 1 });

      const grid = await responsiveRender(this.element, data, {
        gridTitle: 'Title',
      });

      assertGrid(assert, [
        ['Title', 'Package 1', 'Package 2', 'Package 3'],
        ['Perk 1', '✓', '✕', '✕'],
        ['', '$1,000', '$2,000', '$3,000'],
      ]);

      const assertCellIsFocused = makeFocusAssertion(assert, grid);

      await waitForResize(grid, 250);

      assert.dom(grid).doesNotHaveClass('epg_display-as-grid');
      listDisplayIsKeyboardNavigableWithTitle(this, assertCellIsFocused, grid);

      await waitForResize(grid, 600);

      assert.dom(grid).hasClass('epg_display-as-grid');
      gridDisplayIsKeyboardNavigable(this, assertCellIsFocused, grid);
    });
  });
});

function listDisplayIsKeyboardNavigableNoTitle(
  context: Context,
  assertCellIsFocused: (row: number, column: number) => void,
  grid: HTMLDivElement
) {
  tabToFirst(context);
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowDown' });
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowDown' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowDown' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowUp' });
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowUp' });
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowUp' });
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'End' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'Home' });
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'End', ctrlKey: true });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'Home', ctrlKey: true });
  assertCellIsFocused(0, 1);

  clickCell(grid, 0, 2);
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(0, 1);
}

function listDisplayIsKeyboardNavigableWithTitle(
  context: Context,
  assertCellIsFocused: (row: number, column: number) => void,
  grid: HTMLDivElement
) {
  tabToFirst(context);
  assertCellIsFocused(0, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(0, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(0, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowDown' });
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowDown' });
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowDown' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowDown' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowUp' });
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowUp' });
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowUp' });
  assertCellIsFocused(0, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowUp' });
  assertCellIsFocused(0, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'End' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'Home' });
  assertCellIsFocused(0, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'End', ctrlKey: true });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'Home', ctrlKey: true });
  assertCellIsFocused(0, 0);

  clickCell(grid, 0, 2);
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(0, 1);
}

function gridDisplayIsKeyboardNavigable(
  context: Context,
  assertCellIsFocused: (row: number, column: number) => void,
  grid: HTMLDivElement
) {
  tabToFirst(context);
  assertCellIsFocused(0, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowRight' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowDown' });
  assertCellIsFocused(1, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowDown' });
  assertCellIsFocused(2, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowDown' });
  assertCellIsFocused(2, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(2, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(2, 1);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(2, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(2, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowUp' });
  assertCellIsFocused(1, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowUp' });
  assertCellIsFocused(0, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowUp' });
  assertCellIsFocused(0, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'End' });
  assertCellIsFocused(0, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'End', ctrlKey: true });
  assertCellIsFocused(2, 3);

  triggerKeyboardEvent(grid, 'keydown', { key: 'Home' });
  assertCellIsFocused(2, 0);

  triggerKeyboardEvent(grid, 'keydown', { key: 'Home', ctrlKey: true });
  assertCellIsFocused(0, 0);

  clickCell(grid, 2, 2);
  assertCellIsFocused(2, 2);

  triggerKeyboardEvent(grid, 'keydown', { key: 'ArrowLeft' });
  assertCellIsFocused(2, 1);
}

/**
 * Wraps the render function we are testing to ensure that we don't make
 * assertions before the first resize.
 */
function responsiveRender(
  ...args: Parameters<typeof render>
): Promise<HTMLDivElement> {
  return new Promise((resolve) => {
    const perkGrid = render(...args);
    perkGrid.addEventListener('grid-resize', () => resolve(perkGrid), {
      once: true,
    });
  });
}

function waitForResize(
  perkGrid: HTMLDivElement,
  newWidth: number
): Promise<void> {
  return new Promise((resolve) => {
    perkGrid.addEventListener('grid-resize', () => resolve(), { once: true });
    // eslint-disable-next-line no-param-reassign
    perkGrid.style.width = `${newWidth}px`;
  });
}

function tabToFirst(context: Context) {
  (context.element.querySelector('[tabindex="0"]') as HTMLElement).focus();
}

function clickCell(
  grid: HTMLDivElement,
  rowIndex: number,
  columnIndex: number
) {
  const cells = findCells(grid);

  const row = assertExists(cells[rowIndex]);
  const cell = assertExists(row[columnIndex]);

  cell.click();
}

function makeFocusAssertion(assert: Assert, grid: HTMLDivElement) {
  const cells = findCells(grid);

  const cellCount = grid.querySelectorAll(`div.${CLASSES.cell}`).length;

  return (row: number, column: number): void => {
    const cell = assertExists(cells[row]?.[column]);
    const descriptor = `Cell in row ${row}, column ${column}`;
    assert.dom(cell).isFocused(`${descriptor} is focused`);
    assert.deepEqual(
      [...grid.querySelectorAll('[tabindex="0"]')],
      [cell],
      `${descriptor} is only keyboard-focusable element`
    );
    assert.strictEqual(
      [...grid.querySelectorAll('[tabindex="-1"]')].length,
      cellCount - 1,
      'All other elements are only programmatically focusable'
    );
  };
}

function findCells(grid: HTMLElement): HTMLElement[][] {
  return [...grid.querySelectorAll(`div.${CLASSES.row}`)].map((row) => [
    ...row.querySelectorAll(`div.${CLASSES.cell}`),
  ]) as HTMLElement[][];
}
