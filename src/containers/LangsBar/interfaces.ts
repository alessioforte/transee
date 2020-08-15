export type Props = {
  options: Options;
  onChange?: (values: Values) => void;
  onToggleDropdown?: (isDropped: boolean) => void;
  values?: Values;
};

export type Values = {
  selected: Selected;
  threesome: Options;
};

export type Selected = {
  from: string;
  to: string;
};

export type Options = {
  from: Option[];
  to: Option[];
};

export type Option = {
  value: string;
  label: string;
};

export enum Conversion {
  from = 'from',
  to = 'to',
}

export type Target = Conversion.from | Conversion.to;
