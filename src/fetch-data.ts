import { API_ROOT } from './environment';
import { assertIsEventData, EventData } from './types/data';

/**
 * This error will be thrown if there is an issue fetching data for the perk
 * grid, including responses from the server outside of the 200-299 "ok" range.
 * It will also wrap exceptions thrown by `window.fetch`.
 * @link https://developer.mozilla.org/en-US/docs/Web/API/fetch#exceptions
 */
export class PerkGridFetchError extends Error {
  override name = 'PerkGridFetchError';

  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

/**
 * Fetches {@link EventData} for the event with the given id, if found.
 *
 * If the response has a 200-299 status code, will assert that the response data
 * is properly formed. If not, the promise will be rejected with a
 * {@link PerkGridTypeError}. Otherwise, the promise will be resolved with the
 * data.
 *
 * If the response has a code outside of the 200-299 range, the promise will be
 * rejected with a {@link PerkGridFetchError}.
 *
 * Additionally, any exceptions thrown by `window.fetch` will be wrapped with a
 * {@link PerkGridFetchError}.
 */
export async function fetchData(eventId: string): Promise<EventData> {
  try {
    const response = await fetch(
      `${API_ROOT}api/v1/perk_grids/${eventId}.json`
    );

    if (response.ok) {
      const data: unknown = await response.json();
      assertIsEventData(data);
      return data;
    }

    const error = await response.text();
    throw new PerkGridFetchError(
      `Problem fetching data for event id "${eventId}", error=${error}`,
      response.status
    );
  } catch (error: unknown) {
    throw new PerkGridFetchError(
      `Problem fetching data for event id "${eventId}", error=${String(error)}`
    );
  }
}
