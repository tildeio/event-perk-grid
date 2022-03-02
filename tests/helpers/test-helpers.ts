export function triggerKeyboardEvent(
  element: HTMLElement,
  ...args: ConstructorParameters<typeof KeyboardEvent>
): void {
  const event = new KeyboardEvent(...args);
  element.dispatchEvent(event);
}
