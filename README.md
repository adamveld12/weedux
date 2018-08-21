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

/*

or you can do this:

const initialState = { ticker: { counter: 0 } };

const reducers = {
    ticker: (state, action) => {
        switch(action.type) {
            case 'INCREMENT_COUNTER':
            return {
                ...state,
                counter: state.counter + 1,
            };
            case 'DECREMENT_COUNTER':
            return {
                ...state,
                counter: state.counter - 1,
            };
            default: 
              return state;
        }

    }
};
*/

const store = new weedux(initialState, reducers, [thunk]);

store.subscribe((newState) => console.log("State Updated:", newState));

const dispatch = store.dispatch;

dispatch({type: "INCREMENT_COUNTER"});

// do async stuff using the thunk middleware
dispatch((dispatcher, store) => {
  dispatcher({type: "API_CALL_UPDATE_START"});

  fetch("/my/api/endpoint")
    .then((res) => res.json())
    .then((data) => dispatcher({ type: "API_CALL_UPDATE_SUCCESS", payload: data }))
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

const dispatch = store.dispatch;
dispatch((d, state) => {
  d({ type: "MY_ACTION" });
})

```


### `store.dispatch(action) => Promise`:

A function used to dispatch actions to the store. Returns a promise that resolves when the dispatch is completed.

`action`: An object that will be passed to the reducer.

### `store.subscribe(cb) => subscribeHandle`

Adds a callback to the store that is fired whenever a dispatched action fully completes.

`cb`: is a callback that is passed the latest version of the store's state and the action that was used to update it.

returns a handle function that when invoked removes the associated callback from the internal listener

### `store.getState() => [Object]`


returns a copy of the full state of the store.


### `connect(mapStateToProps, mapDispatchToProps, store) => func(React.Component)`

A handy connector that returns a function that injects props/state into the specified React.Component and manages lifecycle events for you.


### `bindActionCreators({ object }, dispatch) => { object}`

Takes an object where each property is a function and returns a new object where each function is wrapped in a dispatch call, passing any arguments that function recieves to the original wrapped function. This is useful for converting many flux actions into a dispatchable wrapped version that is easier to use in your code.

eg.

```javascript
import { bindActionCreators } from 'weedux'

const action = name => ({ type: 'HELLO_ACTION', payload: { name } })

const wrappedAction = bindActionCreators({ action }, dispatch);

// will dispatch the above action
wrappedAction.action('bob');

```
## LICENSE

MIT
