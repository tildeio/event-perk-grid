import { fetchData, PerkGridFetchError, render } from '.';
import { PerkGridTypeError } from './types/utils';

export class PerkGridError extends Error {
  override name = 'PerkGridError';
}

class PerkGrid extends HTMLElement {
  async connectedCallback(): Promise<void> {
    const { eventId, includeStyles, gridTitle, placeholderText, errorText } =
      this.dataset;

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

      render(this, data, {
        includeStyles: includeStyles !== undefined && includeStyles !== 'false',
        gridTitle,
      });
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
