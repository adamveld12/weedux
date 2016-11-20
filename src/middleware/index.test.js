import Weedux from '../index.js';
import { async } from  './index.js';

test('async dispatch 1', () => {
  const store = new Weedux({}, (s) => s, async);
  const dispatch = store.dispatcher();
  const testFn = jest.fn();

  store.onDispatchComplete(ns => testFn());

  return new Promise((resolve) => {

    dispatch((d) => {
      setTimeout(() => {
        d({});
        resolve();
      });

      dispatch({});
      expect(testFn).toHaveBeenCalledTimes(1);
    });

  }).then(() => expect(testFn).toHaveBeenCalledTimes(2));
});
