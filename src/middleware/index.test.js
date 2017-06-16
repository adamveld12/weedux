import Weedux from '../index.js';
import { thunk, logger } from  './index.js';

test('thunk middleware applies when not passed as array', () => {
  const store = new Weedux({}, (s) => s, [thunk, logger]);
  const dispatch = store.dispatch;
  const testFn = jest.fn();

  store.subscribe(ns => testFn());

  return new Promise((resolve) => {
    dispatch((d) => {
      dispatch({ type: "DOPE" });
      resolve();
    });
  }).then(() => expect(testFn).toHaveBeenCalledTimes(1));
});

test('thunk middleware applies when passed as array', () => {
  const store = new Weedux({}, (s) => s, [thunk]);
  const dispatch = store.dispatch;
  const testFn = jest.fn();

  store.subscribe(ns => testFn());

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
