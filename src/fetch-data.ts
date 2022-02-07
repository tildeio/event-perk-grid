import { assertIsEventData, EventData } from './types/data';

export default async function fetchData(eventId: string): Promise<EventData> {
  const response = await fetch(
    `http://localhost:3000/api/v1/perk_grids/${eventId}.json`
  );

  if (response.ok) {
    const json: unknown = await response.json();
    assertIsEventData(json);
    return json;
  }

  // FIXME: Show error message in dom.
  throw new Error(`Problem fetching data for event id ${eventId}`);
}
