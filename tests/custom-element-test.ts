import { module, test } from 'qunit';
import '../src/custom-element';
import type {
  PerkGrid,
  PerkGridDataSet,
  PerkGridError,
} from '../src/custom-element';
import { assertExists } from '../src/types/utils';
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

function renderCustomStyleElement(context: Context, assert: Assert): void {
  const style = document.createElement('style');
  style.innerHTML = `
    .epg_grid { display: grid; }
    .epg_loading { font-size: 24px; }
    .epg_error { font-size: 42px; }
  `;
  context.element.prepend(style);
  assert.dom('style').exists('setup: style element added');
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

  test('handles a 404 (PerkGridFetchError)', async function (this: Context, assert) {
    this.server.use(expectGetEvent(assert, null));

    await renderCustomElement(this, { dataSet: { eventId: 'not-found' } });

    assert.dom('.epg_grid').doesNotExist();
    assert.dom('.epg_loading').doesNotExist();

    assert
      .dom('.epg_error')
      .containsText('There was a problem loading data for the perk grid.');
  });

  test('can be styled by the user', async function (this: Context, assert) {
    const mockEvent = this.factory.makeEventData({ pkgCount: 1, perkCount: 1 });
    this.server.use(expectGetEvent(assert, mockEvent));

    renderCustomStyleElement(this, assert);

    let loadingCount = 0;

    await renderCustomElement(this, {
      dataSet: {
        eventId: mockEvent.id,
        gridTitle: 'Sponsorship Packages',
        placeholderText: 'Gathering data...',
        errorText: 'Uh oh.',
      },
      loadingCallback() {
        loadingCount += 1;
        assert.dom('.epg_loading').hasText('Gathering data...');
        assert
          .dom('.epg_loading')
          .hasStyle(
            { 'font-size': '24px' },
            'the placeholder style applied properly'
          );
      },
    });

    assertGrid(assert, [
      ['Sponsorship Packages', 'Package 1$1,000'],
      ['Perk 1', '✓'],
    ]);

    // This would fail if we used shadow dom
    assert
      .dom('.epg_grid')
      .hasStyle({ display: 'grid' }, 'the style applied properly');
    assert.strictEqual(loadingCount, 1);
  });

  test('can display a customizable error message', async function (this: Context, assert) {
    this.server.use(expectGetEvent(assert, null));

    renderCustomStyleElement(this, assert);

    await renderCustomElement(this, {
      dataSet: { eventId: 'not-found', errorText: 'Uh oh.' },
    });

    assert.dom('.epg_grid').doesNotExist();
    assert.dom('.epg_loading').doesNotExist();

    assert
      .dom('.epg_error')
      .containsText('Uh oh.')
      .hasStyle(
        { 'font-size': '42px' },
        'the placeholder style applied properly'
      );
  });

  test('throws if no event id is provided', async function (this: Context, assert) {
    const PerkGridConstructor = assertExists(customElements.get('perk-grid'));
    const perkGrid = new PerkGridConstructor() as PerkGrid;

    await assert.rejects(
      perkGrid.connectedCallback(),
      function (error: PerkGridError) {
        assert.strictEqual(
          error.message,
          'Cannot render perk-grid. You must include the data-event-id attribute with your event id.'
        );
        return true;
      }
    );

    assert.dom('.epg_grid').doesNotExist();
    assert.dom('.epg_loading').doesNotExist();
    assert.dom('.epg_error').doesNotExist();
  });
});
