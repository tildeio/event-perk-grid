import { assertExists } from '../../src/types/utils';
import { squish } from '../../src/utils/squish';

export function assertGrid(
  assert: Assert,
  grid: string[][],
  displayedAsGrid = true
): void {
  const header = assertExists(grid.shift());

  assert.dom('.epg_loading').doesNotExist();
  assert.dom('.epg_error').doesNotExist();

  const gridEl = document.querySelector('div.epg_grid');

  if (!gridEl || !(gridEl instanceof HTMLDivElement)) {
    throw new Error('grid div not found');
  }

  assert.strictEqual(
    gridEl.style.getPropertyValue('--column-count').trim(),
    (header.length - 1).toString(),
    'the column count CSS variable was properly set'
  );

  assert.dom(gridEl).exists().hasAttribute('role', 'grid');

  assert.dom('.epg_header').exists().hasAttribute('role', 'rowgroup');
  assert.dom('.epg_header .epg_row').exists().hasAttribute('role', 'row');
  assert
    .dom('.epg_header .epg_row .epg_cell.epg_columnheader')
    .exists({ count: header.length })
    .hasAttribute('role', 'columnheader');
  header.forEach((text, i) => {
    const found = gridEl.querySelector(
      `.epg_header .epg_columnheader:nth-child(${i + 1})`
    ) as HTMLDivElement;
    // NOTE: We cannot use DOM assertions here because they will check
    // `textContent`, which includes hidden text
    assert.strictEqual(
      // eslint-disable-next-line unicorn/prefer-dom-node-text-content
      squish(found.innerText),
      text,
      `Element .epg_header .epg_columnheader:nth-child(${
        i + 1
      }) has innerText "${text}"`
    );
  });

  if (displayedAsGrid) {
    const footer = assertExists(grid.pop());
    const rows = grid;

    assert.dom('.epg_body').exists().hasAttribute('role', 'rowgroup');
    assert
      .dom('.epg_body .epg_row')
      .exists({ count: rows.length })
      .hasAttribute('role', 'row');
    rows.forEach((row, rowNumber) => {
      row.forEach((text, cellNumber) => {
        assert
          .dom(
            `.epg_body .epg_row:nth-child(${
              rowNumber + 1
            }) .epg_cell:nth-child(${cellNumber + 1})`
          )
          .hasText(text)
          .hasAttribute('role', cellNumber ? 'gridcell' : 'rowheader');
      });
    });

    assert.dom('.epg_footer').exists().hasAttribute('role', 'rowgroup');
    assert.dom('.epg_footer .epg_row').exists().hasAttribute('role', 'row');
    footer.forEach((text, cellNumber) => {
      assert
        .dom(`.epg_footer .epg_cell:nth-child(${cellNumber + 1})`)
        .hasText(text)
        .hasAttribute('role', cellNumber ? 'gridcell' : 'rowheader');
    });
  } else {
    assert.dom('.epg_body').isNotVisible();
    assert.dom('.epg_footer').isNotVisible();
  }
}
