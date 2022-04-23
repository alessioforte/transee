import React, { useReducer, FunctionComponent } from 'react';
import { ProviderProps } from './interfaces';
import Context from './Context';

const Provider: FunctionComponent<ProviderProps> = ({ children, init }) => {
  const { reducer, setters, initialState } = init;
  const [store, dispatch] = useReducer(reducer, initialState);
  return (
    <Context.Provider value={{ store, dispatch, setters }}>{children}</Context.Provider>
  );
};

export default Provider;
