import { module, test } from 'qunit';
import { fetchData, PerkGridFetchError } from '../src/fetch-data';
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
    this.server.use(expectGetEvent(assert, mockEvent));

    const data = await fetchData(mockEvent.id);

    assert.deepEqual(data, mockEvent, 'it returns the correct event');
  });

  test('it rejects on a 404', async function (this: Context, assert) {
    this.server.use(expectGetEvent(assert, null));

    await assert.rejects(
      fetchData('not-found'),
      function (error: PerkGridFetchError) {
        assert.strictEqual(error.status, 404);
        assert.strictEqual(
          error.message,
          'Problem fetching data for event id "not-found", error={"status":404,"error":"Not found"}'
        );
        return true;
      }
    );
  });

  test('it rejects on a 500', async function (this: Context, assert) {
    const mockEvent = this.factory.makeEventData();
    this.server.use(
      expectGetEvent(assert, mockEvent, {
        responseCallback: (ctx) => [
          ctx.status(500),
          ctx.json({
            status: 500,
            error: 'Internal Server Error',
          }),
        ],
      })
    );

    await assert.rejects(
      fetchData(mockEvent.id),
      function (error: PerkGridFetchError) {
        assert.strictEqual(error.status, 500);
        assert.strictEqual(
          error.message,
          `Problem fetching data for event id "${mockEvent.id}", error={"status":500,"error":"Internal Server Error"}`
        );
        return true;
      }
    );
  });
});
