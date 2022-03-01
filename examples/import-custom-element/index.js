import Component from '@glimmer/component';
import ENV from 'docs/config/environment';

// Import this file for side-effect registration of the perk-grid custom element
import 'event-perk-grid/custom-element';

// Optionally import this file for basic CSS
import 'event-perk-grid/index.css';

export default class PerkGridImportCustomElementComponent extends Component {
  eventId = ENV.EVENT_ID;
}
