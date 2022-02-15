import { API_ROOT } from './environment';
import { assertIsEventData, EventData } from './types/data';

export class PerkGridFetchError extends Error {
  override name = 'PerkGridFetchError';

  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

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
