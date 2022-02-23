import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { modifier } from 'ember-modifier';
import ENV from 'docs/config/environment';
import { fetchData, render } from 'event-perk-grid';
// Optionally import this file for basic CSS
import 'event-perk-grid/index.css';

export default class PerkGridWithCustomElementComponent extends Component {
  @tracked errorMessage = null;

  get data() {
    return this.fetchDataTask.last?.value;
  }

  startDataFetch = modifier(() => {
    this.fetchDataTask.perform();
  });

  renderPerkGrid = modifier((element) => {
    render(element, this.data);
  });

  @task({ drop: true }) *fetchDataTask() {
    try {
      this.errorMessage = null;
      return yield fetchData(ENV.EVENT_ID);
    } catch (error) {
      this.errorMessage = error.message ?? 'Something went wrong.';
    }
  }
}
