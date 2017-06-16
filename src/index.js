import im from 'immutable';
import EventEmitter from 'events';

import middleware from './middleware/index.js';

function combineReducers(reducers) {
  return (initialState, action) =>
    reducers.reduce(
      (currentState, reducerFn) => reducerFn(currentState, action),
      initialState
    );
}

function applyMiddleware(middlewares, store){
  var n;
  middlewares.reverse().forEach(m => n = m(store)(n));
  return n;
}

function rootReducer(reducer) {
  var reducing = false;

  return store => n => action => {
    if (!action || action === null)
      throw new Error("A null or undefined action was erroneously passed to dispatch");

    if (reducing)
      throw new Error("Cannot dispatch an action while reducing");

    reducing = true;
    const newState = reducer(store.getState(), action);
    store.state = im.Map(newState);
    reducing = false;

    store.dispatchEm.emit('updated', store.getState());
  };
}

class Weedux {
  constructor(initialState, reducer, middlewares){
    this.state = im.Map(initialState);
    this.dispatchEm = new EventEmitter();

    reducer = reducer || (s => s);
    if (Array.isArray(reducer)) {
      reducer = combineReducers(reducer);
    }

    middlewares = middlewares || [];
    if (!Array.isArray(middlewares)){
      middlewares = [ middlewares ];
    }

    const mHandler = applyMiddleware(middlewares.concat(rootReducer(reducer)), this);

    this.dispatch = mHandler;

    this.getState = () => this.state.toObject()

    this.subscribe = (cb) => {
      this.dispatchEm.on('updated', cb);
      return () => this.dispatchEm.removeListener('updated', cb);
    }

  }
}

Weedux.middleware = middleware;
module.exports = Weedux;
