import { CLASSES } from '../css-classes';
import { EventData } from '../types/data';
import { createElement } from '../utils/dom';
import enableKeyboardNav from './enable-keyboard-nav';
import { makeResponsive, ResizeEvent } from './make-responsive';
import { body, footer, header } from './nodes';
import { DisplayOption } from './types';

export interface RenderOptions {
  /**
   * If provided, the text-content of the first cell of the perk grid will be
   * set to this text.
   */
  gridTitle?: string | undefined;

  /**
   * Choose one of three options:
   * - "grid": The grid will always be displayed multiple columns.
   * - "list": The grid will be collapsed into a single column of packages. Each
   *   package will have a list (`<ul>`) of its perks displayed within its cell.
   *   NOTE: The grid "list" will still be made up of `<div>` elements with the
   *   `role="grid"` attribute, not a `<ul>` element.
   * - "responsive" (default): The grid will be displayed as a single column on
   *   small screens and multiple columns on large screens. The breakpoint at
   *   which the view is switched from single-column to multi-column format is
   *   the minimum width necessary for the grid element to display all columns
   *   at their specified minimum widths. See {@link RenderOptions.minWidthPerk}
   *   and {@link RenderOptions.minWidthPackage}.
   *   NOTE: These docs assume you are importing the default CSS.
   */
  display?: DisplayOption | undefined;

  /**
   * The minimum width (in pixels) for displaying the Perk header column when
   * the grid is displayed with multiple columns.
   *
   * Defaults to `200` (200px).
   *
   * NOTE: If the `display` option is set to "list", this option will not be
   * used.
   */
  minWidthPerk?: number | undefined;

  /**
   * The minimum width (in pixels) for displaying the Package columns when
   * the grid is displayed with multiple columns.
   *
   * Defaults to `100` (100px).
   *
   * NOTE: If the `display` option is set to "list", this option will not be
   * used.
   */
  minWidthPackage?: number | undefined;

  /**
   * If true, enables keyboard navigation following WAI-ARIA Authoring Practices.
   *
   * Defaults to `true`.
   *
   * @link https://www.w3.org/TR/wai-aria-practices-1.1/examples/grid/dataGrids.html
   */
  allowKeyboardNavigation?: boolean | undefined;
}

/**
 * Replaces the contents of the given parent element with an html grid of event
 * sponsorship packages and perks.
 *
 * @fires {@link ResizeEvent}
 */
export function render(
  parent: HTMLElement,
  data: EventData,
  {
    gridTitle = '',
    display = 'responsive',
    minWidthPerk = 200,
    minWidthPackage = 100,
    allowKeyboardNavigation = true,
  }: RenderOptions = {}
): HTMLDivElement {
  const columnCount = data.packages.length;

  const isResponsive = display === 'responsive';
  const isList = display === 'list';

  const minWidthForGrid = minWidthPerk + columnCount * minWidthPackage;

  const grid = createElement(
    'div',
    `${CLASSES.grid} ${initialDisplayClass(parent, display, minWidthForGrid)}`,
    { role: 'grid' }
  );
  grid.setAttribute(
    'style',
    `
    --column-count: ${columnCount};
    --min-width-perk: ${minWidthPerk}px;
    --min-width-package: ${minWidthPackage}px;
    --max-width-perk: ${minWidthPerk / minWidthForGrid}fr;
    --max-width-package: ${minWidthPackage / minWidthForGrid}fr;
    `
  );

  if (isResponsive) {
    makeResponsive(grid, minWidthForGrid);
  }

  grid.append(header(gridTitle, data, display));

  if (!isList) {
    grid.append(body(data), footer(data));
  }

  parent.replaceChildren(grid);

  // NOTE: This must happen after all of the elements are appended
  if (allowKeyboardNavigation) {
    enableKeyboardNav(grid, isResponsive);
  }

  return grid;
}

// We are assuming that the grid will take up the full width of the parent, so
// this is a best guess. If we are wrong, there may be a brief flash on small
// screens where the perk-grid is displayed as a grid at first before switching
// to a list.
function initialDisplayClass(
  parent: HTMLElement,
  display: DisplayOption,
  minWidthForGrid: number
): string {
  if (display === 'list') {
    return '';
  }

  if (display === 'grid') {
    return CLASSES.displayAsGrid;
  }

  return parent.clientWidth >= minWidthForGrid ? CLASSES.displayAsGrid : '';
}

// eslint-disable-next-line unicorn/prefer-export-from
export { ResizeEvent };
