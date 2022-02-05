import { module, test } from 'qunit';
import render from '../src/render';
import { assertGrid } from './helpers/assert-grid';
import { makeEventData } from './helpers/data-factory';
import { RenderingTestContext, setupRenderingTest } from './test-setup';

module('render', function (hooks) {
  setupRenderingTest(hooks);

  test('renders a basic grid', function (this: RenderingTestContext, assert) {
    const shadow = this.element.attachShadow({ mode: 'open' });
    const data = makeEventData();

    render(shadow, data);

    assertGrid(assert, shadow, [
      ['', 'Gold$3,000', 'Silver$2,000', 'Bronze$1,000'],
      ['Good', '✓', '✓', '✓'],
      ['Better', '✓', '✓', '✕'],
      ['Best', '✓', '✕', '✕'],
    ]);
  });
});
