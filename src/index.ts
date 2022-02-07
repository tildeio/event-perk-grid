import Fetcher from './fetcher';
import render from './render';

export default class PerkGrid extends HTMLElement {
  async connectedCallback(): Promise<void> {
    // FIXME: shadow dom precludes the user from being able to customize the CSS. oops
    const shadow = this.attachShadow({ mode: 'open' });
    const placeholder = document.createElement('div');
    // FIXME: Allow user to customize
    placeholder.textContent = 'Loading...';
    shadow.append(placeholder);

    const { eventId, includeStyles, gridTitle } = this.dataset;

    if (!eventId) {
      throw new Error(
        'Cannot render perk-grid. You must include the data-event-id attribute with your event id.'
      );
    }

    const fetcher = new Fetcher(eventId);
    const data = await fetcher.fetch();

    render(shadow, data, {
      includeStyles: includeStyles !== undefined && includeStyles !== 'false',
      gridTitle,
    });
  }
}

customElements.define('perk-grid', PerkGrid);
