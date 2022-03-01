import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
import config from 'docs/config/environment';

export default helper(function apiDocsLink([uri, text]) {
  return htmlSafe(
    `<a href="${config.rootURL}api${uri}">${text ?? 'API docs'}</a>`
  );
});
