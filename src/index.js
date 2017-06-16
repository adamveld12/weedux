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


class Weedux {
  constructor(initialState, reducer, middlewares){
    reducer = reducer || (s => s);
    if (Array.isArray(reducer)) {
      reducer = combineReducers(reducer);
    }

    middlewares = middlewares || [];
    if (!Array.isArray(middlewares)){
      middlewares = [ middlewares ];
    }

    let state = im.Map(initialState);
    let dispatchEm = new EventEmitter();
    let rootMiddleware = null;

    this.dispatch = (action) => rootMiddleware(action);

    this.getState = () => state.toObject()

    this.subscribe = (cb) => {
      dispatchEm.on('updated', cb);
      return () => dispatchEm.removeListener('updated', cb);
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
        state = im.Map(newState);
        reducing = false;

        dispatchEm.emit('updated', store.getState());
      };
    }

    rootMiddleware = applyMiddleware(middlewares.concat(rootReducer(reducer)), this);
  }
}

Weedux.middleware = middleware;
module.exports = Weedux;
