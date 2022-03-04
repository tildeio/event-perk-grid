import { CLASSES } from '../css-classes';
import debounce from '../utils/debounce';

/**
 * If the grid display is set to be "responsive", this event is fired whenever
 * the grid resizes.
 *
 * @event
 * @property detail - An object containing information about if the grid was
 * resized to "grid view" from "list view".
 *
 * @example
 * ```js
 * const perkGrid = document.querySelector('perk-grid');
 * perkGrid.addEventListener('grid-resize', (event) => {
 *   console.log('grid-resize', event.detail)
 * });
 * ```
 */
export type ResizeEvent = CustomEvent<{
  toGridDisplay: boolean;
  toListDisplay: boolean;
  displayChanged: boolean;
}>;

export function makeResponsive(
  grid: HTMLDivElement,
  minWidthForGrid: number
): void {
  const resizeObserver = new ResizeObserver(
    debounce((entries: ResizeObserverEntry[]) => {
      entries.forEach((entry) => {
        const isWideEnough = entry.contentRect.width >= minWidthForGrid;
        const wasGrid = grid.classList.contains(CLASSES.displayAsGrid);
        const toGridDisplay = !wasGrid && isWideEnough;
        const toListDisplay = wasGrid && !isWideEnough;

        if (toGridDisplay) {
          grid.classList.add(CLASSES.displayAsGrid);
        } else if (toListDisplay) {
          grid.classList.remove(CLASSES.displayAsGrid);
        }

        grid.dispatchEvent(
          new CustomEvent('grid-resize', {
            bubbles: true,
            detail: {
              toGridDisplay,
              toListDisplay,
              displayChanged: toGridDisplay || toListDisplay,
            },
          }) as ResizeEvent
        );
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
