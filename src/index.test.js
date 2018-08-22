import Weedux, { middleware, connect, bindActionCreators, select } from './index.js';

test('reselect selects correct property', () => {
  const initialState = {
    person: {
      name: 'bob',
    },
    animal: {
      dog: {
        name: 'watson',
        age: 3,
      },
    },
  };

    const personSelector = s => s.person;
    const nameSelector = select(personSelector, s => s.name);
    expect(nameSelector(initialState)).toEqual('bob');

    const animalSelector = s => s.animal;
    const ageSelector = select(animalSelector, s => s.dog);
    expect(ageSelector(initialState).age).toEqual(3);
});

test('initial state should be set', () =>{
  const initialState = { a: 5, name: "bob" };
  const store = new Weedux(initialState, (s, a) => s);

  expect(store.getState()).toEqual(initialState);
});

test('entire store api should be available in middleware during binding', () =>{
  const initialState = { a: 5, name: "bob" };
  const store = new Weedux(initialState, (s, a) => s, [
    (({ dispatch, getState, subscribe }) => {
        expect(dispatch).toBeDefined();
        expect(getState).toBeDefined();
        expect(subscribe).toBeDefined();
        return n => a => {}
    })
  ]);
});

test('subscribe should be invoked', () => {
  const initialState = { a: 5, name: "bob" };
  const store = new Weedux(initialState, (s, a) => s);
  const dispatch = store.dispatch;
  const testFn = jest.fn();

  store.subscribe((ns) => testFn());
  expect(testFn).toHaveBeenCalledTimes(0);
  dispatch({});

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      expect(testFn).toHaveBeenCalledTimes(1);
    });
  });
});

test('should correctly call an action with a matching type in an object reducer', () => {
  const initialState = { numbers: { a: 5 }, name: { first: "bob" } };
  const store = new Weedux(initialState, {
    name: {
      changeFirstName: (s, a) => ({ first: a.payload }),
    },
    numbers: {
      changeA: (s, a) => ({ a: a.payload }),
    },
  });

  const { dispatch, getState } = store;
  const testFn = jest.fn();

  store.subscribe((ns) => testFn());
  expect(testFn).toHaveBeenCalledTimes(0);
  dispatch({ type: 'changeFirstName', payload: 'steve' });
  expect(getState()).toEqual({ numbers: { a: 5 }, name: { first: 'steve' } });

  dispatch({ type: 'changeA', payload: 1 });
  expect(getState()).toEqual({ numbers: { a: 1 }, name: { first: 'steve' } });

});

test('should correctly combine object reducers into one', () => {
  const initialState = { numbers: { a: 5 }, name: { first: "bob" } };
  const store = new Weedux(initialState, {
    name: (s, a) => a.type === 'name' ? ({ first: a.payload }) : s,
    numbers: (s, a) => a.type === 'numbers' ? ({ a: a.payload }) : s,
  });

  const { dispatch, getState } = store;
  const testFn = jest.fn();

  store.subscribe((ns) => testFn());
  expect(testFn).toHaveBeenCalledTimes(0);
  dispatch({ type: 'name', payload: 'steve' });
  expect(getState()).toEqual({ numbers: { a: 5 }, name: { first: 'steve' } });

  dispatch({ type: 'numbers', payload: 1 });
  expect(getState()).toEqual({ numbers: { a: 1 }, name: { first: 'steve' } });

});

test('removesubscribe should remove callback', () => {
  const initialState = { a: 5, name: "bob" };
  const store = new Weedux(initialState, (s, a) => s);
  const dispatch = store.dispatch;
  const testFn = jest.fn();

  const handle = store.subscribe((ns) => testFn());
  dispatch({});
  handle();

  dispatch({});
  dispatch({});
  dispatch({});

  expect(testFn).toHaveBeenCalledTimes(1)
});


test('Make sure import works', () => {
   expect(typeof(middleware.thunk)).toEqual("function")
   expect(typeof(middleware.logger)).toEqual("function")
   expect(typeof(connect)).toEqual("function")
   expect(typeof(Weedux)).toEqual("function")
   expect(typeof(bindActionCreators)).toEqual("function")
});
