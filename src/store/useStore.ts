import { useContext, useMemo } from 'react';
import Context from './Context';

const useStore = (): [any, any] => {
  const context = useContext(Context);
  if (!context) {
    throw Error(
      'The `useStore` hook must be called from a descendent of the `Provider`.'
    );
  }

  const { store, dispatch, setters } = context;

  const actions = useMemo(() => {
    const obj = {};
    Object.keys(setters).forEach((key) => {
      obj[key] = (payload) => dispatch(setters[key](payload));
    });
    return obj;
  }, []);

  return [store, actions];
};

export default useStore;
