import { module, test } from 'qunit';
import render from '../src/render';
import { assertGrid } from './helpers/assert-grid';

import { RenderingTestContext, setupRenderingTest } from './test-setup';

module('render', function (hooks) {
  setupRenderingTest(hooks);

  test('renders a basic grid', function (this: RenderingTestContext, assert) {
    const shadow = this.element.attachShadow({ mode: 'open' });
    const data = this.factory.makeEventData();

    render(shadow, data);

    assertGrid(assert, shadow, [
      ['', 'Package 1$1,000', 'Package 2$2,000', 'Package 3$3,000'],
      ['Perk 1', '✓', '✓', '✓'],
      ['Perk 2', '✓', '✓', '✕'],
      ['Perk 3', '✓', '✕', '✕'],
    ]);
    assert.dom('style', shadow).doesNotExist();
    assert.dom('.epg_grid', shadow).doesNotHaveStyle({ display: 'grid' });
  });

  test('can include styles', function (this: RenderingTestContext, assert) {
    const shadow = this.element.attachShadow({ mode: 'open' });
    const data = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

    render(shadow, data, { includeStyles: true });

    assertGrid(assert, shadow, [
      ['', 'Package 1$1,000'],
      ['Perk 1', '✓'],
    ]);
    assert.dom('style', shadow).exists();
    assert.dom('.epg_grid', shadow).hasStyle({ display: 'grid' });
  });

  test('replaces any existing children', function (this: RenderingTestContext, assert) {
    const shadow = this.element.attachShadow({ mode: 'open' });
    const element = document.createElement('div');
    element.setAttribute('id', 'replace-me');
    shadow.append(element);

    assert.dom('#replace-me', shadow).exists('There is an element to replace');

    const data = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

    render(shadow, data);

    assertGrid(assert, shadow, [
      ['', 'Package 1$1,000'],
      ['Perk 1', '✓'],
    ]);
    assert.dom('#replace-me', shadow).doesNotExist('The element was replaced');
  });
});
