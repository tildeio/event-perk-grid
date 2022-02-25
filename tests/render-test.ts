import { module, test } from 'qunit';
import { render } from '../src/render';
import { assertGrid } from './helpers/assert-grid';
import { RenderingTestContext, setupRenderingTest } from './test-setup';

type Context = RenderingTestContext;

/**
 * Wraps the render function we are testing to ensure that we don't make
 * assertions before the first resize.
 */
function responsiveRender(
  ...args: Parameters<typeof render>
): Promise<HTMLDivElement> {
  return new Promise((resolve) => {
    const perkGrid = render(...args);
    perkGrid.addEventListener('resized', () => resolve(perkGrid));
  });
}

function waitForResize(
  perkGrid: HTMLDivElement,
  newWidth: number
): Promise<void> {
  return new Promise((resolve) => {
    perkGrid.addEventListener('resized', () => resolve());
    // eslint-disable-next-line no-param-reassign
    perkGrid.style.width = `${newWidth}px`;
  });
}

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
