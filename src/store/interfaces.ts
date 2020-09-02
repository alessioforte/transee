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
  setGoogle: (payload: any) => void;
  setLangs: (payload: Values) => void;
  setInput: (payload: string) => void;
};

export type ProviderProps = {
  children?: ReactElement | ReactElement[] | string;
  init: Init;
  
};

type Init = {
  initialState?: any,
  reducer: any,
  setters: any,
}

export type Ctx = {
  store: any;
  dispatch: React.Dispatch<unknown>;
};
