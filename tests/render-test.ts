import { module, test } from 'qunit';
import render from '../src/render';
import {
  EVENT_DATA_FACTORY,
  PACKAGE_FACTORY,
  PERK_FACTORY,
  PERK_WITH_VALUE_FACTORY,
} from './helpers/data-factory';
import { RenderingTestContext, setupRenderingTest } from './test-setup';

module('render', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', function (this: RenderingTestContext, assert) {
    const shadow = this.element.attachShadow({ mode: 'open' });

    const perks = ['Good', 'Better', 'Best'].map((description) =>
      PERK_FACTORY.create({ description })
    );
    const packages = ['Bronze', 'Silver', 'Gold'].map((name) =>
      PACKAGE_FACTORY.create({
        name,
        perks: perks.map((p) => PERK_WITH_VALUE_FACTORY.create(p)),
      })
    );
    const data = EVENT_DATA_FACTORY.create({
      name: 'My Event',
      perks,
      packages,
    });

    render(shadow, data);

    assert.ok(true);

    assert.dom('.epg_grid', shadow).exists();
    assert.dom('.epg_header', shadow).exists();
  });
});

/*
<div role="grid" class="epg_grid">
  <div role="rowgroup" class="epg_header epg_rowgroup">
    <div role="row" class="epg_row">
      <div role="columnheader" class="epg_cell epg_columnheader"></div>
      <div role="columnheader" class="epg_cell epg_columnheader epg_package">
        <div class="epg_package-name">Bronze</div>
        <div class="epg_package-price">$0</div>
        <div class="epg_package-attributes"></div>
      </div>
      <div role="columnheader" class="epg_cell epg_columnheader epg_package">
        <div class="epg_package-name">Silver</div>
        <div class="epg_package-price">$0</div>
        <div class="epg_package-attributes"></div>
      </div>
      <div role="columnheader" class="epg_cell epg_columnheader epg_package">
        <div class="epg_package-name">Gold</div>
        <div class="epg_package-price">$0</div>
        <div class="epg_package-attributes"></div>
      </div>
    </div>
  </div>
  <div role="rowgroup" class="epg_body epg_rowgroup">
    <div role="row" class="epg_row">
      <div role="rowheader" class="epg_cell epg_rowheader">
        <div class="epg_perk-description">Good</div>
        <div class="epg_perk-attributes"></div>
      </div>
      <div
        role="gridcell"
        class="epg_cell epg_perk-value epg_perk-value-simple epg_perk-value-truthy"
      >
        ✓
      </div>
      <div
        role="gridcell"
        class="epg_cell epg_perk-value epg_perk-value-simple epg_perk-value-truthy"
      >
        ✓
      </div>
      <div
        role="gridcell"
        class="epg_cell epg_perk-value epg_perk-value-simple epg_perk-value-truthy"
      >
        ✓
      </div>
    </div>
    <div role="row" class="epg_row">
      <div role="rowheader" class="epg_cell epg_rowheader">
        <div class="epg_perk-description">Better</div>
        <div class="epg_perk-attributes"></div>
      </div>
      <div
        role="gridcell"
        class="epg_cell epg_perk-value epg_perk-value-simple epg_perk-value-truthy"
      >
        ✓
      </div>
      <div
        role="gridcell"
        class="epg_cell epg_perk-value epg_perk-value-simple epg_perk-value-truthy"
      >
        ✓
      </div>
      <div
        role="gridcell"
        class="epg_cell epg_perk-value epg_perk-value-simple epg_perk-value-truthy"
      >
        ✓
      </div>
    </div>
    <div role="row" class="epg_row">
      <div role="rowheader" class="epg_cell epg_rowheader">
        <div class="epg_perk-description">Best</div>
        <div class="epg_perk-attributes"></div>
      </div>
      <div
        role="gridcell"
        class="epg_cell epg_perk-value epg_perk-value-simple epg_perk-value-truthy"
      >
        ✓
      </div>
      <div
        role="gridcell"
        class="epg_cell epg_perk-value epg_perk-value-simple epg_perk-value-truthy"
      >
        ✓
      </div>
      <div
        role="gridcell"
        class="epg_cell epg_perk-value epg_perk-value-simple epg_perk-value-truthy"
      >
        ✓
      </div>
    </div>
  </div>
</div>
*/
