import React, { useReducer, FunctionComponent } from 'react';
import { ProviderProps } from './interfaces';
import Context from './Context';

const Provider: FunctionComponent<ProviderProps> = ({ children, initialState, reducer, actions }) => {
  const [store, dispatch] = useReducer(reducer, initialState);
  return (
    <Context.Provider value={{ store, dispatch, actions }}>{children}</Context.Provider>
  );
};

export default Provider;
