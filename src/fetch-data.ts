import { API_ROOT } from './environment';
import { assertIsEventData, EventData } from './types/data';

export async function fetchData(eventId: string): Promise<EventData> {
  const response = await fetch(`${API_ROOT}api/v1/perk_grids/${eventId}.json`);

  if (response.ok) {
    const json: unknown = await response.json();
    assertIsEventData(json);
    return json;
  }

  throw new Error(`Problem fetching data for event id ${eventId}`);
}
