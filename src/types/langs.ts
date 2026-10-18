/**
 * The single definition of the language types.
 *
 * There used to be three overlapping sets: `Langs` in `interfaces/index.ts`
 * (threesome + selected), `Langs` in `services/interfaces.ts` (just from/to),
 * and `Values`/`Selected` in `containers/LangsBar/interfaces.ts`. `getData` was
 * declared as taking the second while callers passed the first.
 */

export type Option = {
  value: string;
  label: string;
};

/** The three quick-pick slots shown on each side of the bar. */
export type Options = {
  from: Option[];
  to: Option[];
};

/** The language pair a translation is actually performed with. */
export type Selected = {
  from: string;
  to: string;
};

/** The full language state: quick-pick slots plus the active pair. */
export type Langs = {
  threesome: Options;
  selected: Selected;
};

export enum Conversion {
  from = 'from',
  to = 'to',
}

export type Target = Conversion.from | Conversion.to;
