import im from 'immutable';
import EventEmitter from 'events';

import middleware from './middleware/index.js';


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

    let reducing = false;
    const actionQueue = [];
    const rootDispatcher = (action) => {
      actionQueue.push(action);

      if (reducing)
        return;

      reducing = true;


      while(actionQueue.length > 0){
        const currentAction = actionQueue.shift();
        const newState =  reduce(this.getState(), currentAction, reducer);
        this.state = im.Map(newState);
      }

      reducing = false;
      this.dispatchEm.emit('updated', this.getState());
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

Weedux.middleware = middleware;
module.exports = Weedux;

