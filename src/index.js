import im from 'immutable';
import EventEmitter from 'events';

class Weedux {
  constructor(initialState, reducer, middleware){
    this.state = im.Map(initialState);
    this.dispatchEm = new EventEmitter();

    this.reducer = reducer || (s => s);
    if (Array.isArray(reducer)) {
      this.reducer = combine(reducer);
    }

    this.middleware = middleware || [s => this.dispatcher];
    if (!Array.isArray(middleware)){
      this.middleware = [middleware];
    }

    this.dispatcher = applyMiddleware(this.middleware, this);
  }

  // dispatch returns a dispatch function that can be used to dispatch actions
  dispatcher(next){
    return (action) => {
      const newState =  reduce(this.store(), action, this.reducer);
      this.state = im.Map(newState);
      this.dispatchEm.emit('updated', newState, action);
    }
  }

  // store returns the current state
  store(){ return this.state.toObject(); }

  // onDispatchComplete is called when a dispatch is completed
  onDispatchComplete(cb){
    this.dispatchEm.on('updated', cb);
    return cb;
  }

  removeOnDispatchComplete(cb){
    this.dispatchEm.removeListener('updated', cb);
  }
}

module.exports = Weedux;

function combine(reducers) {
  return (initialState, action) =>
    reducers.reduce(
      (currentState, reducerFn) => reducerFn(currentState, action),
      initialState
    );
}

function reduce(oldState, action, reducer){
  if (!action || action === null) {
    throw new Error("A null or undefined action was erroneously passed to dispatch");
  }

  return reducer(oldState, action) || oldState;
}

function applyMiddleware(middleware, store){
  let dispatcher = store.dispatcher();

  middleware.reverse().forEach((m) => {
    dispatcher = m(store)(dispatcher);
  })

  return () => dispatcher;
}
