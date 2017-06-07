# Weedux
[![Build Status](https://semaphoreci.com/api/v1/adamveld12/weedux/branches/master/badge.svg)](https://semaphoreci.com/adamveld12/weedux)

A tiny simple toy redux like thing for learning.

## How to use

Install like so:
```
$ npm install weedux --save
```

Use it like this:
```javascript
import weedux, { middleware } from 'weedux';
const { thunk } = middleware;

const initialState = { counter: 0 };

const reducers = [
  (currentState, action) => {
    const newState = currentState;

    if (action.type === "INCREMENT_COUNTER")
        newState.counter = currentState.counter + 1;

    return newState;
  },
  (currentState, action) => {
    const newState = currentState;

    if (action.type === "DECREMENT_COUNTER")
        newState.counter = currentState.counter - 1;

    return newState;
  },
];

const store = new weedux(initialState, reducers, [thunk]);

store.onDispatchComplete((newState) => console.log("State Updated:", newState));

const dispatch = store.dispatcher();

dispatch({type: "INCREMENT_COUNTER"});

// do async stuff using the thunk middleware
dispatch((dispatcher, store) => {
  dispatcher({type: "API_CALL_UPDATE_START"});

  fetch("/my/api/endpoint")
    .then((res) => res.json())
    .then((data) => dispatcher({ type: "API_CALL_UPDATE_SUCCESS", payload: data }));
    .catch(() => dispatcher({type: "API_CALL_UPDATE_FAIL"}));
});
```

### `new weedux(initialState, [reducer], [middleware])`:

Creates a new store.

`initialState` is an object that will seed the Flux Store with a start state.

`reducer` is a function (or array of functions) that get passed a state object and the dispatched flux action. The returned value from these functions become the new state. If passed an undefined reducer, an identity function is used.

`middlewares` is a function (or array of functions) that take the form of (store) => (next) => (action); pretty much the same layout as a redux middleware.


Comes with middleware on the `weedux.middleware`, use it like so:
```
import Weedux, { middleware } from 'weedux';
const { thunk, logger } = middleware;

const store = new Weedux({}, reducers, [thunk, logger]);

const dispatch = store.dispatcher();
dispatch((d, state) => {
  d({ type: "MY_ACTION" });
})

```


### `dispatcher()`:

returns a dispatch function that can be used to dispatch actions to the store. The function takes an action.

`dispatch(action)`

`action`: An object that will be passed to the reducer.

### `onDispatchComplete(cb)`

Adds a callback to the store that is fired whenever a dispatched action fully completes.

`cb`: is a callback that is passed the latest version of the store's state and the action that was used to update it.

returns a handle that can be used to remove the callback later.


### `removeOnDispatchComplete(handle)`

Removes the callback from the store that belongs to the specified handle.


`handle`: the handle used to remove a previously registered callback.

if the handle value is not a valid handle or is a handle that belongs to a previously removed callback, this function returns without error and does nothing.


### `getState()`

returns a copy of the full state of the store.


## LICENSE

MIT
