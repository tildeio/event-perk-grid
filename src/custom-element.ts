import { fetchData, PerkGridFetchError } from './fetch-data';
import { render } from './render';
import { PerkGridTypeError } from './types/utils';
import { div } from './utils/rendering';

/**
 * This error will be thrown in the event that the perk-grid element cannot be
 * rendered.
 */
export class PerkGridError extends Error {
  override name = 'PerkGridError';
}

/**
 * The `<perk-grid>` custom element displays a grid of sponsorship packages and
 * their perks using data from the Tilde Events App API.
 *
 * Attributes:
 * - `data-event-id` _(required)_: The ID corresponding to the event.
 * - `data-grid-title`: An optional title to be displayed in the first cell.
 * - `data-placeholder-text`: Optional placeholder text to override the default
 *    text displayed while the data is loading.
 * - `data-error-text`: Optional error text to override the default text
 *    displayed if there is an error while rendering the element.
 */
export class PerkGrid extends HTMLElement {
  async connectedCallback(): Promise<void> {
    this.dispatchEvent(new CustomEvent('connecting'));

    const { eventId, gridTitle, placeholderText, errorText } = this.dataset;

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
      this.dispatchEvent(new CustomEvent('error', { detail: error }));

      if (
        error instanceof PerkGridFetchError ||
        error instanceof PerkGridTypeError
      ) {
        const errorMessage = div('epg_error', {
          textContent:
            errorText ?? 'There was a problem loading data for the perk grid.',
        });
        this.replaceChildren(errorMessage);

        // eslint-disable-next-line no-console
        console.error(error);
      } else {
        throw error;
      }
    }

    this.dispatchEvent(new CustomEvent('ready'));
  }

  disconnectedCallback(): void {
    this.dispatchEvent(new CustomEvent('disconnected'));
  }
}

if (customElements.get('perk-grid')) {
  // eslint-disable-next-line no-console
  console.warn(
    'Cannot re-register perk-grid custom element. It was already registered.'
  );
} else {
  customElements.define('perk-grid', PerkGrid);
}
