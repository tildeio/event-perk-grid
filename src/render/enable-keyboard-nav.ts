import { CLASSES } from '../css-classes';
import { assertExists } from '../types/utils';
import { isVisible } from '../utils/dom';
import { ResizeEvent } from './make-responsive';

type Cells = HTMLElement[][];

type Position = { row: number; column: number };

const DEFAULT_POSITION = { row: 0, column: 0 };

class GridFocusManager {
  private cells: Cells;

  constructor(private grid: HTMLElement) {
    this.cells = setupCells(grid);
    this.setup();
  }

  reset(): void {
    this.cells = setupCells(this.grid);
    this.currentPosition = DEFAULT_POSITION;
  }

  private setup(): void {
    this.grid.addEventListener('keydown', this.onKeydown.bind(this));
    this.grid.addEventListener('click', this.onClick.bind(this));
  }

  private currentPosition: Position = DEFAULT_POSITION;

  private get row(): number {
    return this.currentPosition.row;
  }

  private get lastRow(): number {
    return this.cells.length - 1;
  }

  private get column(): number {
    return this.currentPosition.column;
  }

  private get lastColumn(): number {
    // Assumes all rows have the same number of columns.
    return assertExists(this.cells[0]).length - 1;
  }

  private onKeydown(event: KeyboardEvent): void {
    const displayedAsGrid = this.grid.classList.contains(CLASSES.displayAsGrid);

    switch (event.key) {
      case 'ArrowRight':
        this.updatePosition({ column: this.column + 1 });
        break;

      case 'ArrowLeft':
        this.updatePosition({ column: this.column - 1 });
        break;

      case 'ArrowDown':
        if (displayedAsGrid) {
          this.updatePosition({ row: this.row + 1 });
        } else {
          this.updatePosition({ column: this.column + 1 });
        }
        break;

      case 'ArrowUp':
        if (displayedAsGrid) {
          this.updatePosition({ row: this.row - 1 });
        } else {
          this.updatePosition({ column: this.column - 1 });
        }
        break;

      case 'Home':
        this.updatePosition({
          column: 0,
          row: displayedAsGrid && event.ctrlKey ? 0 : this.row,
        });
        break;

      case 'End':
        this.updatePosition({
          column: this.lastColumn,
          row: displayedAsGrid && event.ctrlKey ? this.lastRow : this.row,
        });
        break;

      default:
        break;
    }
  }

  private onClick(event: MouseEvent) {
    if (event.target instanceof HTMLElement) {
      const cell = event.target.closest(`div.${CLASSES.cell}`);
      if (cell instanceof HTMLElement) {
        this.updatePosition(this.getPosition(cell));
      }
    }
  }

  /**
   * Focus new position.
   * Ensure only the latest position is focusable by keyboard.
   * Keep track of latest position.
   */
  private updatePosition(updates: Partial<Position>) {
    const row =
      updates.row === undefined
        ? this.row
        : Math.max(Math.min(updates.row, this.lastRow), 0);
    const column =
      updates.column === undefined
        ? this.column
        : Math.max(Math.min(updates.column, this.lastColumn), 0);

    this.currentCell.tabIndex = -1;
    this.currentPosition = { row, column };
    this.focusCurrent();
  }

  private focusCurrent(): void {
    this.currentCell.focus();
    this.currentCell.tabIndex = 0;
  }

  private get currentCell(): HTMLElement {
    return assertExists(this.getCell(this.row, this.column));
  }

  private getCell(
    rowIndex: number,
    columnIndex: number
  ): HTMLElement | undefined {
    const row = this.cells[rowIndex];
    return row && row[columnIndex];
  }

  private getPosition(cell: HTMLElement): Position {
    // eslint-disable-next-line no-restricted-syntax
    for (const row of this.cells) {
      const index = row.indexOf(cell);
      if (index > -1) {
        return {
          column: index,
          row: this.cells.indexOf(row),
        };
        break;
      }
    }

    throw new Error('Position not found for cell');
  }
}

export default function enableKeyboardNav(
  grid: HTMLElement,
  isResponsive: boolean
): void {
  const manager = new GridFocusManager(grid);

  function maybeResetFocusManager(event: ResizeEvent) {
    if (!manager || event.detail.displayChanged) {
      manager.reset();
    }
  }

  if (isResponsive) {
    grid.addEventListener('grid-resize', (event) => {
      maybeResetFocusManager(event as ResizeEvent);
    });
  }
}

function setupCells(grid: HTMLElement) {
  const cells: Cells = [];
  [...grid.querySelectorAll(`div.${CLASSES.row}`)].forEach((row, rowIndex) => {
    cells.push(setupRowCells(row, rowIndex));
  });
  return cells;
}

function setupRowCells(row: Element, rowIndex: number) {
  const rowCells = [
    ...row.querySelectorAll(`div.${CLASSES.cell}`),
  ] as HTMLElement[];

  rowCells.forEach((cell) => {
    // eslint-disable-next-line no-param-reassign
    cell.tabIndex = -1;
  });

  if (rowIndex === 0) {
    const firstCell = () => assertExists(rowCells[0]);
    if (!isVisible(firstCell())) {
      rowCells.shift();
    }
    firstCell().tabIndex = 0;
  }
  return rowCells;
}
