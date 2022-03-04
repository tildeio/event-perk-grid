export interface CreateElementOptions {
  role?: string;
  textContent?: string;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className: string,
  { role, textContent }: CreateElementOptions = {}
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tagName);

  if (role) {
    el.setAttribute('role', role);
  }
  el.setAttribute('class', className);

  if (textContent) {
    el.textContent = textContent;
  }

  return el;
}

export function isVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length > 0
  );
}
