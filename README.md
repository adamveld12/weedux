# Weedux

A simple toy redux like thing.

## How to use

Install like so:
```
$ npm install weedux --save
```

Use it like this:
```es6
import weedux from 'weedux';

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

const store = new weedux(initialState, reducers);

store.onDispatchComplete((newState) => console.log("State Updated:", newState));

const dispatch = store.dispatcher();

dispatch({type: "INCREMENT_COUNTER"});

// do async stuff
dispatch((dispatcher) => {
  dispatcher({type: "PAYLOAD_UPDATE_START"});

  fetch("/my/api/endpoint")
    .then((res) => res.json())
    .then((data) => dispatcher({ type: "PAYLOAD_UPDATE_SUCCESS", payload: data }));
    .catch(() => dispatcher({type: "PAYLOAD_UPDATE_FAIL"}));
});
```

### `new weedux(initialState, reducer)`:

`initialState` is an object that will seed the Flux Store with a start state.

`reducer` is a function (or array of functions) that get passed a state object and the dispatched flux action. The returned value from these functions become the new state. If passed an undefined reducer, an identity function is used.


### `dispatcher(action)`:

`action`: An object or function. If action is an object, that object will be passed to the reducer.


If the action is a function, then that function will be passed the dispatcher, making it easy to do async actions.
```es6
dispatcher((dispatch) => {
  dispatch({ type: "INCREMENT_COUNTER" });
})
```

### `onDispatchComplete(cb)`

`cb`: is a callback that is passed the latest version of the store's state and the action that was used to update it.

returns a handle that can be used to remove the callback later


### `removeOnDispatchComplete(handle)`

`handle`: the handle used to remove a previously registered callback.

if the handle value is not a valid handle or is a handle that belongs to a previously removed callback, this function returns without error.

## LICENSE

MIT
