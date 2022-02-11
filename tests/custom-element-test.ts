import { module, test } from 'qunit';
import '../src/custom-element';
import { assertGrid } from './helpers/assert-grid';
import { expectGetEvent } from './helpers/server';
import {
  RenderingTestContext,
  ServerTestContext,
  setupRenderingTest,
  setupServer,
} from './test-setup';

type Context = RenderingTestContext & ServerTestContext;

type RenderOptions = {
  eventId: string | null;
};

async function renderCustomElement(
  context: Context,
  options?: RenderOptions
): Promise<Event> {
  return new Promise((resolve) => {
    const { eventId } = { eventId: null, ...options };
    const perkGrid = document.createElement('perk-grid');
    perkGrid.addEventListener('ready', resolve);

    if (eventId) {
      perkGrid.dataset['eventId'] = eventId;
    }

    context.element.append(perkGrid);
  });
}

module('custom element', function (hooks) {
  setupRenderingTest(hooks);
  setupServer(hooks);

  test('renders a basic grid', async function (this: Context, assert) {
    const mockEvent = this.factory.makeEventData();
    this.server.use(expectGetEvent(assert, mockEvent));

    await renderCustomElement(this, { eventId: mockEvent.id });

    assertGrid(assert, [
      ['', 'Package 1$1,000', 'Package 2$2,000', 'Package 3$3,000'],
      ['Perk 1', '✓', '✓', '✓'],
      ['Perk 2', '✓', '✓', '✕'],
      ['Perk 3', '✓', '✕', '✕'],
    ]);
    assert.dom('style').doesNotExist();
    assert.dom('.epg_grid').doesNotHaveStyle({ display: 'grid' });
  });

  // skip('can be styled by the user', function (this: Context, assert) {
  //   const mockEvent = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

  //   this.server.use(expectGetEvent(assert, mockEvent));

  //   await renderCustomElement(this, { eventId: mockEvent.id });

  //   assertGrid(assert, [
  //     ['', 'Package 1$1,000'],
  //     ['Perk 1', '✓'],
  //   ]);

  //   assert
  //     .dom('.epg_grid')
  //     .doesNotHaveStyle(
  //       { display: 'grid' },
  //       'setup: grid element not already styled'
  //     );

  //   const style = document.createElement('style');
  //   style.innerHTML = `.epg_grid { display: grid }`;
  //   this.element.prepend(style);
  //   assert.dom('style').exists('setup: style element added');

  //   assert.dom('.epg_grid').hasStyle({ display: 'grid' });
  // });

  // skip('replaces any existing children', function (this: Context, assert) {
  //   const placeholder = document.createElement('div');
  //   placeholder.setAttribute('id', 'replace-me');
  //   this.element.append(placeholder);

  //   assert.dom('#replace-me').exists('There is an element to replace');

  //   const data = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });

  //   render(this.element, data);

  //   assertGrid(assert, [
  //     ['', 'Package 1$1,000'],
  //     ['Perk 1', '✓'],
  //   ]);
  //   assert.dom('#replace-me').doesNotExist('The element was replaced');
  // });
});
