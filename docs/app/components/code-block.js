import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';

export default class CodeBlock extends Component {
  @task({ restartable: true }) *copyText(event) {
    event.preventDefault();
    navigator.clipboard.writeText(this.args.text);

    yield timeout(2000);
  }
}
