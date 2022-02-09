import { module, test } from 'qunit';
import { fetchData } from '../src/fetch-data';
import { expectGetEvent } from './helpers/server';
import {
  ServerTestContext,
  setupServer,
  setupTest,
  TestContext,
} from './test-setup';

type Context = TestContext & ServerTestContext;

module('fetchData', function (hooks) {
  setupTest(hooks);
  setupServer(hooks);

  test('it fetches', async function (this: Context, assert) {
    const mockEvent = this.factory.makeEventData();
    this.server.use(expectGetEvent(mockEvent));

    const data = await fetchData(mockEvent.id);

    assert.deepEqual(data, mockEvent, 'it returns the correct event');
  });
});
