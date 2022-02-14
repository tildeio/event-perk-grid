import { fetchData, PerkGridFetchError } from './fetch-data';
import { render } from './render';
import { PerkGridTypeError } from './types/utils';
import { div } from './utils/rendering';

export type PerkGridDataSet = Partial<{
  eventId: string;
  gridTitle: string;
  placeholderText: string;
  errorText: string;
}>;

class PerkGridError extends Error {
  override name = 'PerkGridError';
}

class PerkGrid extends HTMLElement {
  async connectedCallback(): Promise<void> {
    this.dispatchEvent(new CustomEvent('connected'));

    const { eventId, gridTitle, placeholderText, errorText } = this
      .dataset as PerkGridDataSet;

    const placeholder = div('epg_loading', {
      textContent: placeholderText ?? 'Loading...',
    });
    this.append(placeholder);

    if (!eventId) {
      throw new PerkGridError(
        'Cannot render perk-grid. You must include the data-event-id attribute with your event id.'
      );
    }

    this.dispatchEvent(new CustomEvent('loading'));

    try {
      const data = await fetchData(eventId);
      render(this, data, { gridTitle });
    } catch (error: unknown) {
      if (
        error instanceof PerkGridFetchError ||
        error instanceof PerkGridTypeError
      ) {
        const errorMessage = div('epg_error', {
          textContent:
            errorText ?? 'There was a problem loading data for the perk grid.',
        });
        this.replaceChildren(errorMessage);
        console.error(error);
      } else {
        throw error;
      }
    }

    this.dispatchEvent(new CustomEvent('ready'));
  }
}

customElements.define('perk-grid', PerkGrid);

export {};
