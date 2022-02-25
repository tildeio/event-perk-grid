import { fetchData, PerkGridFetchError } from './fetch-data';
import { render, CLASSES as GRID_CLASSES, DisplayOption } from './render';
import { PerkGridTypeError } from './types/utils';
import { createElement } from './utils/rendering';

/**
 * The values listed here are used as CSS classes. See source link for more
 * information.
 */
export const CLASSES = {
  /** See the './render' file for more details. */
  ...GRID_CLASSES,
  /** The element displayed while the grid is loading */
  loading: 'epg_loading' as const,
  /** The element displayed if there is an error while loading the grid */
  error: 'epg_error' as const,
};

/**
 * The following dataset properties can be set on the `<perk-grid>` element by
 * including them as `data-` attributes on the element.
 *
 * Only `data-event-id` is required. All other attributes are optional.
 */
export interface PerkGridDataSet {
  /**
   * _REQUIRED_: Set attribute `data-event-id`.
   * The ID corresponding to the event
   */
  eventId: string;

  /**
   * Set attribute `data-grid-title`.
   * An optional title to be displayed in the first cell.
   */
  gridTitle?: string;

  /**
   * Set attribute `data-placeholder-text`.
   * Optional placeholder text to override the default text displayed while the
   * data is loading.
   */
  placeholderText?: string;

  /**
   * Set attribute `data-error-text`.
   * Optional error text to override the default text.
   */
  errorText?: string;

  /**
   * Set attribute `data-display`.
   *
   * Choose one of three options:
   * - "grid": The grid will always be displayed multiple columns.
   * - "list": The grid will be collapsed into a single column of packages. Each
   *   package will have a list (`<ul>`) of its perks displayed within its cell.
   *   NOTE: The grid "list" will still be made up of `<div>` elements with the
   *   `role="grid"` attribute, not a `<ul>` element.
   * - "responsive" (default): The grid will be displayed as a single column on
   *   small screens and multiple columns on large screens. The breakpoint at
   *   which the view is switched from single-column to multi-column format is
   *   the minimum width necessary for the grid element to display all columns
   *   at their specified minimum widths. See
   *   {@link PerkGridDataSet.minWidthPerk} and
   *   {@link PerkGridDataSet.minWidthPackage}.
   *   NOTE: These docs assume you are importing the default CSS.
   */
  display?: DisplayOption;

  /**
   * The minimum width (in pixels) for displaying the Perk header column when
   * the grid is displayed with multiple columns.
   *
   * Defaults to `200` (200px).
   *
   * NOTE: If the `display` option is set to "list", this option will not be
   * used.
   */
  minWidthPerk?: number | undefined;

  /**
   * The minimum width (in pixels) for displaying the Package columns when
   * the grid is displayed with multiple columns.
   *
   * Defaults to `100` (100px).
   *
   * NOTE: If the `display` option is set to "list", this option will not be
   * used.
   */
  minWidthPackage?: number | undefined;
}

/**
 * This error will be thrown in the event that the perk-grid element cannot be
 * rendered.
 */
export class PerkGridError extends Error {
  override name = 'PerkGridError';
}

/**
 * Fired when the `<perk-grid>` element begins connecting.
 *
 * @event
 *
 * @example
 * ```js
 * const perkGrid = document.querySelector('perk-grid');
 * perkGrid.addEventListener('connecting', (event) => {
 *   console.info('connecting')
 * });
 * ```
 */
export type ConnectingEvent = CustomEvent<Record<string, never>>;

/**
 * Fired when the `<perk-grid>` element loading state is displayed and just
 * before the element begins loading data.
 *
 * @event
 *
 * @example
 * ```js
 * const perkGrid = document.querySelector('perk-grid');
 * perkGrid.addEventListener('loading', (event) => {
 *   console.info('loading')
 * });
 * ```
 */
export type LoadingEvent = CustomEvent<Record<string, never>>;

/**
 * Fired _if_ there is an error while the `<perk-grid>` element is loading or
 * rendering the data.
 *
 * @event
 * @property detail - The error that resulted in the event being fired.
 *
 * @example
 * ```js
 * const perkGrid = document.querySelector('perk-grid');
 * perkGrid.addEventListener('error', (event) => {
 *   console.error('error', event.detail)
 * });
 * ```
 */
export type ErrorEvent = CustomEvent<{ detail: unknown }>;

/**
 * Fired when the `<perk-grid>` element has completed loading and rendering the
 * data.
 *
 * @event
 *
 * @example
 * ```js
 * const perkGrid = document.querySelector('perk-grid');
 * perkGrid.addEventListener('ready', (event) => {
 *   console.info('ready')
 * });
 * ```
 */
export type ReadyEvent = CustomEvent<Record<string, never>>;

/**
 * Fired when the `<perk-grid>` element is disconnected from the DOM.
 *
 * @event
 *
 * @example
 * ```js
 * const perkGrid = document.querySelector('perk-grid');
 * perkGrid.addEventListener('disconnected', (event) => {
 *   console.info('disconnected')
 * });
 * ```
 */
export type DisconnectedEvent = CustomEvent<Record<string, never>>;

/**
 * The `<perk-grid>` custom element displays a grid of sponsorship packages and
 * their perks using data from the Tilde Events App API.
 *
 * Attributes:
 * The `data-event-id` attribute is required. All other attributes are optional.
 * @see {@link PerkGridDataSet} for more information about optional attributes.
 */
export class PerkGrid extends HTMLElement {
  /**
   * Fetches the data and attaches the perk grid children to the PerkGrid
   * HTMLElement.
   *
   * @fires {@link ConnectingEvent}
   * @fires {@link LoadingEvent}
   * @fires {@link ErrorEvent}
   * @fires {@link ReadyEvent}
   */
  async connectedCallback(): Promise<void> {
    this.dispatchEvent(new CustomEvent('connecting') as ConnectingEvent);

    const {
      eventId,
      gridTitle,
      placeholderText,
      errorText,
      display,
      minWidthPerk,
      minWidthPackage,
    } = this.dataset as Partial<PerkGridDataSet>;

    const placeholder = createElement('div', CLASSES.loading, {
      textContent: placeholderText ?? 'Loading...',
    });
    this.append(placeholder);

    if (!eventId) {
      throw new PerkGridError(
        'Cannot render perk-grid. You must include the data-event-id attribute with your event id.'
      );
    }

    this.dispatchEvent(new CustomEvent('loading') as LoadingEvent);

    try {
      const data = await fetchData(eventId);
      render(this, data, {
        gridTitle,
        display,
        minWidthPerk,
        minWidthPackage,
      });
    } catch (error: unknown) {
      this.dispatchEvent(
        new CustomEvent('error', { detail: error }) as ErrorEvent
      );

      if (
        error instanceof PerkGridFetchError ||
        error instanceof PerkGridTypeError
      ) {
        const errorMessage = createElement('div', CLASSES.error, {
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

    this.dispatchEvent(new CustomEvent('ready') as ReadyEvent);
  }

  /**
   * @fires {@link DisconnectedEvent}
   */
  disconnectedCallback(): void {
    this.dispatchEvent(new CustomEvent('disconnected') as DisconnectedEvent);
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

export {};
