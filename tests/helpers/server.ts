import {
  RequestHandler,
  ResponseTransformer,
  rest,
  RestContext,
  setupWorker,
  SetupWorkerApi as Server,
} from 'msw';
import { API_ROOT } from '../../src/environment';
import { EventData } from '../../src/types/data';
import { inspect } from '../../src/utils/inspect';

export type ExpectGetEventOptions = {
  responseCallback?: (ctx: RestContext) => ResponseTransformer[];
};

export function expectGetEvent(
  assert: Assert,
  expectedEvent: EventData | null,
  { responseCallback }: ExpectGetEventOptions = {}
): RequestHandler {
  return rest.get(
    'http://localhost:3000/test/api/v1/perk_grids/:eventId.json',
    (req, res, ctx) => {
      assert.ok(true, '[GET event] Request made');

      const { eventId } = req.params;

      if (typeof eventId !== 'string') {
        return res.networkError(`Event id ${inspect(eventId)} not valid.`);
      }

      const didFindEvent = expectedEvent?.id === eventId;

      if (expectedEvent) {
        assert.true(didFindEvent, '[GET event] Expected event found');
      } else {
        assert.false(didFindEvent, '[GET event] No event found as expected');
      }

      if (responseCallback) {
        return res.once(...responseCallback(ctx));
      }

      if (didFindEvent) {
        return res.once(ctx.status(200), ctx.json(expectedEvent));
      }

      return res.once(
        ctx.status(404),
        ctx.json({ status: 404, error: 'Not found' })
      );
    }
  );
}

export default async function makeServer(): Promise<Server> {
  const defaultHandlers = [
    rest.get('/ready', (_req, res, ctx) => res.once(ctx.status(200))),
    rest.all(`${API_ROOT}*`, (req, res, ctx) =>
      res(
        ctx.status(404, 'No handler registered'),
        ctx.json({
          status: 404,
          error: `No handler registered for ${req.url.toString()}. Call expectGetEvent to register one.`,
        })
      )
    ),
  ];
  const server = setupWorker(...defaultHandlers);
  await server.start({
    serviceWorker: {
      url: new URL('mockServiceWorker.js', window.location.href).href,
    },
    waitUntilReady: true,
  });

  // HACK: Unfortunately, awaiting server.start doesn't seem to actually do
  // anything, so the tests often fail when the test server has first started.
  // This poll ensures that we don't make any real fetch requests until the
  // server is actually ready.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch('/ready');
      if (response.ok) {
        return server;
      }
    } catch (error: unknown) {
      console.error(error);
    }
  }
}

// eslint-disable-next-line unicorn/prefer-export-from
export { Server };
