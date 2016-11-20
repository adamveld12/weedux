import im from 'immutable';
import EventEmitter from 'events';

class Weedux {
  constructor(initialState, reducer, middlewares){
    this.state = im.Map(initialState);
    this.dispatchEm = new EventEmitter();

    reducer = reducer || (s => s);
    if (Array.isArray(reducer)) {
      reducer = combine(reducer);
    }

    middlewares = middlewares || [];
    if (!Array.isArray(middlewares)){
      middlewares = [ middlewares ];
    }

    const rootDispatcher = (action) => {
      const newState =  reduce(this.getState(), action, reducer);
      this.state = im.Map(newState);
      this.dispatchEm.emit('updated', newState, action);
    };

    const mHandler = applyMiddleware(middlewares, rootDispatcher, this);
    this.dispatcher = () => mHandler;
  }

  // store returns the current state
  store(){ return this.state.toObject(); }

  // store returns the current state
  getState(){ return this.state.toObject(); }

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

function applyMiddleware(middlewares, dispatcher, store){
  middlewares.reverse().forEach(m => dispatcher = m(store)(dispatcher));
  return dispatcher;
}
