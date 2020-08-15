import { useContext, useMemo } from 'react';
import Context from './Context';

const useStore = (): [any, () => void] => {
  const context = useContext(Context);
  if (!context) {
    throw Error(
      'The `useStore` hook must be called from a descendent of the `Provider`.'
    );
  }

  const { store, dispatch, actions } = context;

  const callbacks = useMemo(() => {
    const obj = {};
    Object.keys(actions).forEach((key) => {
      obj[key] = (payload) => dispatch(actions[key](payload));
    });
    return obj;
  }, []);

  return [store, callbacks];
};

export default useStore;
