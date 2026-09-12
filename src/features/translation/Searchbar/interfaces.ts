import { ReactElement } from 'react';

export type SearchbarData = {
  name: string;
  value: string;
};

export type Props = {
  onChange?: (data: SearchbarData) => void;
  onResize?: (height?: number | undefined) => void;
  onDebounce?: (data: SearchbarData) => void;
  loading?: boolean;
  name?: string;
  placeholder?: string;
  suggestions?: ([string, string])[];
  initialValue?: string,
  delay?: number;
  isError?: boolean;
  message?: string;
  renderTips?: () => ReactElement | null;
  renderIcons?: () => ReactElement | null;
  renderFooter?: () => ReactElement | null;
  disabled?: boolean;
};

export type Tip = {
  key: number | string;
  value: string;
  label?: string;
};
