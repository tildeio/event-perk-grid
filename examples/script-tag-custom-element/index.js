import Component from '@glimmer/component';
import ENV from 'docs/config/environment';

export default class PerkGridScriptTagCustomElementComponent extends Component {
  eventId = ENV.EVENT_ID;
}
