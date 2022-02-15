import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | custom-element', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:custom-element');
    assert.ok(route);
  });
});
