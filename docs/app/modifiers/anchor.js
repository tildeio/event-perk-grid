import { modifier } from 'ember-modifier';
import { dasherize } from '@ember/string';

export default modifier((element, [anchorOverride]) => {
  const text = element.innerText.trim();
  const anchor = document.createElement('a');
  anchor.href = `#${anchorOverride ?? dasherize(text)}`;
  anchor.innerText = text;
  element.replaceChildren(anchor);
  element.classList.add('has-anchor');
});
