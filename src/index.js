import im from 'immutable';
import EventEmitter from 'events';

import middleware from './middleware/index.js';
import connect from './connect.js';

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

function rootReducer(reducer, storeInternal) {
    var reducing = false;
    const { dispatchEm } = storeInternal;

    return store => n => action => {
        if (!action || action === null)
            throw new Error("A null or undefined action was erroneously passed to dispatch");

        if (reducing)
            throw new Error("Cannot dispatch an action while reducing");

        const { getState } = store;

        reducing = true;
        const newState = reducer(getState(), action);
        storeInternal.setState(newState);
        reducing = false;

        dispatchEm.emit('updated', getState());
    };
}


class Weedux {
  constructor(initialState = {}, reducer = (s => s), middlewares = []){
    if (Array.isArray(reducer))
      reducer = combineReducers(reducer);

    if (!Array.isArray(middlewares))
      middlewares = [ middlewares ];

    let state = im.Map(initialState);
    let rootMiddleware = null;
    const dispatchEm = new EventEmitter();

    this.dispatch = (action) => rootMiddleware(action);
    this.getState = () => state.toObject();

    this.subscribe = (cb) => {
      dispatchEm.on('updated', cb);
      return () => dispatchEm.removeListener('updated', cb);
    };

    rootMiddleware = applyMiddleware(middlewares.concat(rootReducer(reducer, {
        setState: (ns) => state = im.Map(ns),
        dispatchEm
    })), this);

  }
}

Weedux.connect = connect;
Weedux.middleware = middleware;
module.exports = Weedux;
