import { module, test } from 'qunit';
import { render } from '../src/render';
import { assertGrid } from './helpers/assert-grid';
import { RenderingTestContext, setupRenderingTest } from './test-setup';

module('render', function (hooks) {
  setupRenderingTest(hooks);

  test('renders a basic grid', function (this: RenderingTestContext, assert) {
    const data = this.factory.makeEventData();

    render(this.element, data);

    assertGrid(assert, [
      ['', 'Package 1', 'Package 2', 'Package 3'],
      ['Perk 1', '✓', '✓', '✓'],
      ['Perk 2', '✓', '✓', '✕'],
      ['Perk 3', '✓', '✕', '✕'],
      ['', '$1,000', '$2,000', '$3,000'],
    ]);
    assert.dom('style').doesNotExist();
    assert.dom('.epg_grid').doesNotHaveStyle({ display: 'grid' });
  });

  test('can be styled by the user', function (this: RenderingTestContext, assert) {
    const data = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

    render(this.element, data);

    assertGrid(assert, [
      ['', 'Package 1'],
      ['Perk 1', '✓'],
      ['', '$1,000'],
    ]);

    assert
      .dom('.epg_grid')
      .doesNotHaveStyle(
        { display: 'grid' },
        'setup: grid element not already styled'
      );

    const style = document.createElement('style');
    style.innerHTML = `.epg_grid { display: grid }`;
    this.element.prepend(style);
    assert.dom('style').exists('setup: style element added');

    assert.dom('.epg_grid').hasStyle({ display: 'grid' });
  });

  test('replaces any existing children', function (this: RenderingTestContext, assert) {
    const placeholder = document.createElement('div');
    placeholder.setAttribute('id', 'replace-me');
    this.element.append(placeholder);

    assert.dom('#replace-me').exists('There is an element to replace');

    const data = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

    render(this.element, data);

    assertGrid(assert, [
      ['', 'Package 1'],
      ['Perk 1', '✓'],
      ['', '$1,000'],
    ]);
    assert.dom('#replace-me').doesNotExist('The element was replaced');
  });
});
