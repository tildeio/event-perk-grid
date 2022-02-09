import { API_ROOT } from './environment';
import { assertIsEventData, EventData } from './types/data';

export async function fetchData(eventId: string): Promise<EventData> {
  const response = await fetch(`${API_ROOT}api/v1/perk_grids/${eventId}.json`);

  console.info(API_ROOT);

  if (response.ok) {
    const json: unknown = await response.json();
    assertIsEventData(json);
    return json;
  }

  // FIXME: Show error message in dom.
  throw new Error(`Problem fetching data for event id ${eventId}`);
}
