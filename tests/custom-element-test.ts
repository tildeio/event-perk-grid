import { module, test } from 'qunit';
import '../src/custom-element';
import type { PerkGridDataSet } from '../src/custom-element';
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
  dataSet?: PerkGridDataSet;
  loadingCallback?: () => void;
};

async function renderCustomElement(
  context: Context,
  { dataSet, loadingCallback }: RenderOptions = {}
): Promise<Event> {
  return new Promise((resolve) => {
    const perkGrid = document.createElement('perk-grid');
    if (loadingCallback) {
      perkGrid.addEventListener('loading', loadingCallback);
    }
    perkGrid.addEventListener('ready', resolve);

    if (dataSet) {
      Object.entries(dataSet).forEach(([key, value]) => {
        perkGrid.dataset[key] = value;
      });
    }

    if (dataSet?.eventId) {
      perkGrid.dataset['eventId'] = dataSet.eventId;
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

    await renderCustomElement(this, { dataSet: { eventId: mockEvent.id } });

    assertGrid(assert, [
      ['', 'Package 1$1,000', 'Package 2$2,000', 'Package 3$3,000'],
      ['Perk 1', '✓', '✓', '✓'],
      ['Perk 2', '✓', '✓', '✕'],
      ['Perk 3', '✓', '✕', '✕'],
    ]);
    assert.dom('style').doesNotExist();
    assert.dom('.epg_grid').doesNotHaveStyle({ display: 'grid' });
  });

  test('has a placeholder', async function (this: Context, assert) {
    const mockEvent = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });
    this.server.use(expectGetEvent(assert, mockEvent));

    let loadingCount = 0;

    await renderCustomElement(this, {
      dataSet: { eventId: mockEvent.id },
      loadingCallback() {
        loadingCount += 1;
        assert.dom('.epg_loading').hasText('Loading...');
      },
    });

    assertGrid(assert, [
      ['', 'Package 1$1,000'],
      ['Perk 1', '✓'],
    ]);
    assert.strictEqual(loadingCount, 1);
  });

  test('can be styled by the user', async function (this: Context, assert) {
    const mockEvent = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });
    this.server.use(expectGetEvent(assert, mockEvent));

    let loadingCount = 0;

    await renderCustomElement(this, {
      dataSet: {
        eventId: mockEvent.id,
        gridTitle: 'Sponsorship Packages',
        placeholderText: 'Gathering data...',
      },
      loadingCallback() {
        loadingCount += 1;
        assert.dom('.epg_loading').hasText('Gathering data...');
      },
    });

    assertGrid(assert, [
      ['Sponsorship Packages', 'Package 1$1,000'],
      ['Perk 1', '✓'],
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

    // This would fail if we used shadow dom
    assert
      .dom('.epg_grid')
      .hasStyle({ display: 'grid' }, 'the style applied properly');
    assert.strictEqual(loadingCount, 1);
  });
});
