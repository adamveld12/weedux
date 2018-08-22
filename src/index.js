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

        try {
          reducing = true;
          const newState = reducer(getState(), action);
          storeInternal.setState(newState);
        } catch(error) {
          console.error('An error occured when reducing:', error);
        } finally {
          reducing = false;
          dispatchEm.emit('updated', getState());
        }
    };
}

function reduceObject(reducers = {}) {
  return (initialState, action) => {
    return Object.keys(reducers).reduce((acc, key) => {
      const r = reducers[key];
      const state = acc[key];

      if (!r) {
        return acc;
      }

      if (typeof(r) === 'function') {
        return { ...acc, [key]: r(state, action) };
      } else if (typeof(r) === 'object') {
        const actionReducer = r[action.type];

        if (!actionReducer) {
          return acc;
        }

        if (typeof(actionReducer) !== 'function') {
          throw new Error(`${key}.${action.type} is not a function that can reduce the action`);
        }

        return { ...acc, [key]: actionReducer(state, action) };
      } else {
        throw new Error(`expected a reducer function at ${key}`);
      }
    }, initialState);
  };
}


class Weedux {
  constructor(initialState = {}, reducer = (s => s), middlewares = []){
    if (typeof(reducer) === 'object') {
      reducer = reduceObject(reducer)
    }
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

    rootMiddleware = applyMiddleware([
      ...middlewares,
      rootReducer(reducer, {
        setState: (ns) => state = im.Map(ns),
        dispatchEm
      })
    ], this);

  }
}

function bindActionCreators(actionCreators, dispatch) {
    const boundActions = Object.keys(actionCreators).reduce((acc, key) => {
        acc[key] = (...args) => dispatch(actionCreators[key](...args));
        return acc;
    }, {});

    return boundActions;
};

const createSelector = (selectorFunc, mapper) => (state) => mapper(selectorFunc(state));

Weedux.select = createSelector;
Weedux.bindActionCreators = bindActionCreators;
Weedux.connect = connect;
Weedux.middleware = middleware;
module.exports = Weedux;
