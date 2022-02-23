import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
import * as string from 'lodash/string';

export default helper(function code([snippet]) {
  return htmlSafe(`<code>${string.escape(snippet)}</code>`);
});
