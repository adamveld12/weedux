import Weedux, { middleware } from './index.js';

test('initial state should be set', () =>{
  const initialState = { a: 5, name: "bob" };
  const store = new Weedux(initialState, (s, a) => s);

  expect(store.store()).toEqual(initialState);
});

test('onDispatchComplete should be invoked', () => {
  const initialState = { a: 5, name: "bob" };
  const store = new Weedux(initialState, (s, a) => s);
  const dispatch = store.dispatcher();
  const testFn = jest.fn();

  store.onDispatchComplete((ns) => testFn());
  expect(testFn).toHaveBeenCalledTimes(0);

  dispatch({});
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      expect(testFn).toHaveBeenCalledTimes(1) ;
    })
  })
});

test('removeOnDispatchComplete should remove callback', () => {
  const initialState = { a: 5, name: "bob" };
  const store = new Weedux(initialState, (s, a) => s);
  const dispatch = store.dispatcher();
  const testFn = jest.fn();

  const handle = store.onDispatchComplete((ns) => testFn());
  dispatch({});
  store.removeOnDispatchComplete(handle);

  dispatch({});
  dispatch({});
  dispatch({});

  expect(testFn).toHaveBeenCalledTimes(1)
});


test('Make sure import works', () => {
   expect(typeof(middleware.thunk)).toEqual("function")
   expect(typeof(middleware.logger)).toEqual("function")
   expect(typeof(Weedux)).toEqual("function")
});

