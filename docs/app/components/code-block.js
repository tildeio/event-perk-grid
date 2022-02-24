import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import hljs from 'highlight.js';

export default class CodeBlock extends Component {
  @task({ restartable: true }) *copyText(event) {
    event.preventDefault();
    navigator.clipboard.writeText(this.args.text);

    yield timeout(2000);
  }

  get highlightedText() {
    return htmlSafe(
      hljs.highlight(this.args.text, { language: this.args.language }).value
    );
  }
}
