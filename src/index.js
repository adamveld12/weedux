import im from 'immutable';
import EventEmitter from 'events';

function combine(reducers) {
  return (initialState, action) =>
    reducers.reduce(
      (currentState, reducerFn) => reducerFn(currentState, action),
      initialState
    );
}

function reduce(oldState, action, reducer){
    if (!action || action === null) {
      reject("A null or undefined action was erroneously passed to dispatch");
      return;
    }

    return reducer(oldState, action) || oldState;
}

class Weedux {
  constructor(initialState, reducer){
    this.state = im.Map(initialState);
    this.dispatchEm = new EventEmitter();

    this.reducer = reducer || ((s) => s);

    if (Array.isArray(reducer)) {
      this.reducer = combine(reducer);
    }
  }

  // dispatch returns a dispatch function that can be used to dispatch actions
  dispatcher(){
    return (action) => {
        if (typeof(action) === 'function') {
          action(this.dispatcher());
        } else {
          const newState =  reduce(this.state.toObject(), action, this.reducer);
          this.state = im.Map(newState);
          this.dispatchEm.emit('updated', newState, action);
        }
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

module.exports = Weedux
