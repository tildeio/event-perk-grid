import { fetchData, PerkGridFetchError } from './fetch-data';
import { render } from './render';
import { PerkGridTypeError } from './types/utils';

class PerkGridError extends Error {
  override name = 'PerkGridError';
}

class PerkGrid extends HTMLElement {
  async connectedCallback(): Promise<void> {
    const { eventId, gridTitle, placeholderText, errorText } = this.dataset;

    const placeholder = document.createElement('div');
    placeholder.textContent = placeholderText ?? 'Loading...';
    this.append(placeholder);

    if (!eventId) {
      throw new PerkGridError(
        'Cannot render perk-grid. You must include the data-event-id attribute with your event id.'
      );
    }

    try {
      const data = await fetchData(eventId);
      render(this, data, { gridTitle });
    } catch (error: unknown) {
      if (
        error instanceof PerkGridFetchError ||
        error instanceof PerkGridTypeError
      ) {
        placeholder.textContent =
          errorText ?? 'There was a problem loading data for the perk grid.';
        console.error(error);
      } else {
        throw error;
      }
    }
  }
}

customElements.define('perk-grid', PerkGrid);

export {};
