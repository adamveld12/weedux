import Weedux from '../index.js';
import { async, logger } from  './index.js';

test('async middleware applies when not passed as array', () => {
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

test('async middleware applies when passed as array', () => {
  const store = new Weedux({}, (s) => s, [async]);
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
