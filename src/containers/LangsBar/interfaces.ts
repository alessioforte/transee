import type { Langs, Options } from '@/types/langs';

export type { Langs, Options, Option, Selected, Target } from '@/types/langs';
export { Conversion } from '@/types/langs';

export type Props = {
  options: Options;
  onChange?: (values: Langs) => void;
  onToggleDropdown?: (isDropped: boolean) => void;
  values?: Langs;
};
