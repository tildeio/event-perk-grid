import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { modifier } from 'ember-modifier';
import config from 'docs/config/environment';

export default class FetchExampleFileComponent extends Component {
  @tracked errorMessage = null;

  get text() {
    return this.fetchFileTask.last?.value;
  }

  startFileFetch = modifier(() => {
    this.fetchFileTask.perform();
  });

  @task({ drop: true }) *fetchFileTask() {
    try {
      this.errorMessage = null;
      const response = yield fetch(
        `${config.rootURL}examples/${this.args.file}`
      );
      const text = yield response.text();
      if (response.ok) {
        return text;
      } else {
        this.errorMessage = `Something went wrong. ${text}`;
      }
    } catch (error) {
      this.errorMessage = error.message ?? 'Something went wrong.';
    }
  }
}
