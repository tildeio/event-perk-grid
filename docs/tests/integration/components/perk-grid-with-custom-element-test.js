import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

function renderCustomElement() {
  return new Promise((resolve) => {
    render(hbs`<Examples::ImportCustomElement />`).then(() => {
      const perkGrid = document.querySelector('perk-grid');
      perkGrid.addEventListener('ready', resolve);
    });
  });
}

module(
  'Integration | Component | examples/import-custom-element',
  function (hooks) {
    setupRenderingTest(hooks);

    skip('it renders', async function (assert) {
      await renderCustomElement();

      assert.dom(this.element).hasText('');
    });
  }
);
