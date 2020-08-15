import { ReactElement } from 'react';
import { Values } from '../containers/LangsBar/interfaces';

export type Store = {
  langs: Values;
  suggestions: [];
  data: unknown;
  theme: string;
  input: string;
  shortcut: string;
};

export type Action = {
  type: string;
  payload: any;
};

export type Actions = {
  setSuggestions: (payload: []) => void;
  setData: (payload: any) => void;
  setLangs: (payload: Values) => void;
  setInput: (payload: string) => void;
};

export type ProviderProps = {
  children?: ReactElement | ReactElement[] | string;
  initialState?: any,
  reducer: any,
  actions: any,
};

export type Ctx = {
  store: Settings;
  dispatch: React.Dispatch<unknown>;
};
