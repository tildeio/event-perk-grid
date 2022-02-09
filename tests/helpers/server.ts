import {
  RequestHandler,
  rest,
  setupWorker,
  SetupWorkerApi as Server,
} from 'msw';
import { API_ROOT } from '../../src/environment';
import { EventData } from '../../src/types/data';
import { inspect } from '../../src/utils/inspect';

export function expectGetEvent(
  expectedEvent: EventData | null
): RequestHandler {
  return rest.get(
    'http://localhost:3000/test/api/v1/perk_grids/:eventId.json',
    (req, res, ctx) => {
      const { eventId } = req.params;

      if (typeof eventId !== 'string') {
        return res.networkError(`Event id ${inspect(eventId)} not valid.`);
      }

      if (expectedEvent?.id === eventId) {
        return res.once(ctx.status(200), ctx.json(expectedEvent));
      }

      return res.once(
        ctx.status(404),
        ctx.json({ status: 404, error: 'Not found' })
      );
    }
  );
}

export default function makeServer(): Server {
  const defaultHandler = rest.all(`${API_ROOT}*`, (req, res, ctx) =>
    res(
      ctx.status(404, 'No handler registered'),
      ctx.json({
        status: 404,
        error: `No handler registered for ${req.url.toString()}. Call expectGetEvent to register one.`,
      })
    )
  );
  return setupWorker(defaultHandler);
}

// eslint-disable-next-line unicorn/prefer-export-from
export { Server };
