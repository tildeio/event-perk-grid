import { CLASSES } from '../css-classes';
import debounce from '../utils/debounce';

export function makeResponsive(
  grid: HTMLDivElement,
  minWidthForGrid: number
): void {
  const resizeObserver = new ResizeObserver(
    debounce((entries: ResizeObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width > minWidthForGrid) {
          entry.target.classList.add(CLASSES.displayAsGrid);
        } else {
          grid.classList.remove(CLASSES.displayAsGrid);
        }
        // Private event for testing
        grid.dispatchEvent(new CustomEvent('resized'));
      });
    }, 300)
  );

  resizeObserver.observe(grid);

  const mutationObserver = new MutationObserver(() => {
    if (!document.body.contains(grid)) {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    }
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
}
