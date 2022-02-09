import { fetchData, render } from '.';

class PerkGrid extends HTMLElement {
  async connectedCallback(): Promise<void> {
    const placeholder = document.createElement('div');
    // FIXME: Allow user to customize
    placeholder.textContent = 'Loading...';
    this.append(placeholder);

    const { eventId, includeStyles, gridTitle } = this.dataset;

    if (!eventId) {
      throw new Error(
        'Cannot render perk-grid. You must include the data-event-id attribute with your event id.'
      );
    }

    const data = await fetchData(eventId);

    render(this, data, {
      includeStyles: includeStyles !== undefined && includeStyles !== 'false',
      gridTitle,
    });
  }
}

customElements.define('perk-grid', PerkGrid);
