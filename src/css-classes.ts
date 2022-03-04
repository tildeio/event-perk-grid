import { Perk, PerkValue } from './types/data';

/**
 * The values listed here are used as CSS classes. See source link for more
 * information.
 */
export const CLASSES = {
  /**
   * The element displayed while the grid is loading.
   * Only used in custom-element.
   */
  loading: 'epg_loading' as const,
  /**
   * The element displayed if there is an error while loading the grid/
   * Only used in custom-element.
   */
  error: 'epg_error' as const,
  /** The parent grid element, once loaded with no error */
  grid: 'epg_grid' as const,
  /**
   * If the grid element has this class, the element should be displayed as a
   * grid rather than as a list.
   */
  displayAsGrid: 'epg_display-as-grid' as const,
  /** The grid header rowgroup element */
  header: 'epg_header' as const,
  /** The grid body rowgroup element */
  body: 'epg_body' as const,
  /** The grid footer rowgroup element */
  footer: 'epg_footer' as const,
  /** All rowgroup elements */
  rowgroup: 'epg_rowgroup' as const,
  /** All row elements */
  row: 'epg_row' as const,
  /** All columnheader elements */
  columnheader: 'epg_columnheader' as const,
  /** All rowheader elements */
  rowheader: 'epg_rowheader' as const,
  /** All gridcell, columnheader, and rowheader elements */
  cell: 'epg_cell' as const,
  /** The columnheader element containing the grid title, if one is provided. */
  title: 'epg_title' as const,
  /** The heading element containing the grid title, if one exists. */
  caption: 'epg_caption' as const,
  /** All gridcell and columnheader elements related to a Package */
  package: 'epg_package' as const,
  /** All gridcell and rowheader elements related to a Perk */
  perk: 'epg_perk' as const,
  /** Lists of perks within the package header elements */
  packagePerkList: 'epg_package-perk-list' as const,
  /** All Package Name or Perk Description elements */
  descriptor: 'epg_descriptor' as const,
  attributes: {
    /** All Package/Park attribute elements */
    container: 'epg_attributes' as const,
    /** All Package/Park "sold-out" attribute elements */
    soldOut: 'epg_attributes-sold-out' as const,
    /** All Package/Park "limited" attribute elements */
    limited: 'epg_attributes-limited' as const,
  },
  /**
   * @param perk
   * @param value A {@link PerkValue} or undefined. If undefined, the value is falsy.
   * @returns A string of classes for selecting a perk value.
   *
   * @example
   * ```js
   * CLASSES.perkValue(mySimplePerk, false);
   * #=> 'epg_perk-value epg_perk-value-simple epg_perk-value-falsy'
   *
   * CLASSES.perkValue(myQuantityPerk, 1);
   * #=> 'epg_perk-value epg_perk-value-quantity epg_perk-value-truthy'
   *
   * CLASSES.perkValue(myFreeformPerk, undefined);
   * #=> 'epg_perk-value epg_perk-value-freeform epg_perk-value-falsy'
   * ```
   */
  perkValue(perk: Perk, value: PerkValue | undefined): string {
    return `epg_perk-value epg_perk-value-${perk.type} epg_perk-value-${
      value ? 'truthy' : 'falsy'
    }`;
  },
};
