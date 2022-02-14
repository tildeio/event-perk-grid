export type DivOptions = Partial<{
  role: string;
  textContent: string;
}>;

export function div(
  className: string,
  { role, textContent }: DivOptions = {}
): HTMLDivElement {
  const element = document.createElement('div');

  if (role) {
    element.setAttribute('role', role);
  }
  element.setAttribute('class', className);

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}
