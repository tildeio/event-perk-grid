export default function debounce<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
): (this: unknown, ...args: T) => void {
  let timer: NodeJS.Timeout;
  return function debounceInner(this: unknown, ...args: T) {
    clearTimeout(timer);
    timer = setTimeout(() => callback.apply(this, args), delay);
  };
}
