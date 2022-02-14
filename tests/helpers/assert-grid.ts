export function assertGrid(
  assert: Assert,
  [header, ...rows]: [header: string[], ...rows: string[][]]
): void {
  assert.dom('.epg_loading').doesNotExist();
  assert.dom('.epg_error').doesNotExist();

  const gridEl = document.querySelector('div.epg_grid');

  if (!gridEl || !(gridEl instanceof HTMLDivElement)) {
    throw new Error('grid div not found');
  }

  assert.strictEqual(
    gridEl.style.getPropertyValue('--epg-column-count').trim(),
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
    assert
      .dom(`.epg_header .epg_columnheader:nth-child(${i + 1})`)
      .hasText(text);
  });

  assert.dom('.epg_body').exists().hasAttribute('role', 'rowgroup');
  assert
    .dom('.epg_body .epg_row')
    .exists({ count: rows.length })
    .hasAttribute('role', 'row');
  rows.forEach((row, rowNumber) => {
    row.forEach((text, cellNumber) => {
      assert
        .dom(
          `.epg_body .epg_row:nth-child(${rowNumber + 1}) .epg_cell:nth-child(${
            cellNumber + 1
          })`
        )
        .hasText(text)
        .hasAttribute('role', cellNumber ? 'gridcell' : 'rowheader');
    });
  });
}
