import type { Langs, Option, Options } from '@/types/langs';

export type { Langs, Options, Option, Selected, Target } from '@/types/langs';
export { Conversion } from '@/types/langs';

export type Props = {
  options: Options;
  onChange?: (values: Langs) => void;
  onToggleDropdown?: (isDropped: boolean) => void;
  /** Called when the dropdown's height changes. */
  onResize?: () => void;
  values?: Langs;
  /** The language Google detected while the source is `auto`. */
  detected?: Option;
};
