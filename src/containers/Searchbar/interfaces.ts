import { ReactElement } from 'react';

export type SearchbarData = {
  name: string;
  value: string;
};

export type Props = {
  onChange?: (data: SearchbarData) => void;
  onResize?: (height: number) => void;
  onDebounce?: (data: SearchbarData) => void;
  loading?: boolean;
  name?: string;
  suggestions?: Tip[];
  initialValue?: string,
  delay?: number;
  isError?: boolean;
  message?: string;
  showIcons?: boolean;
  renderTips?: () => ReactElement | null;
};

export type Tip = {
  key: number | string;
  value: string;
  label?: string;
};
