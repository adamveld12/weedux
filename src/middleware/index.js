/*
Allows passing a function to a dispatch call that receivees a dispatcher and the current state as arguments.
This allows you to execute asynchronous calls and dispatch as they are executed
*/
const createThunk = store => n => a =>
  (typeof(a) === "function") ? a(store.dispatch, store.getState()) : n(a)

/*
Logs actions before they are dispatched
*/
const createLogger = (store) => n => a => {
  console.log("Dispatching ", a);
  n(a);
}

/*
Allows you to handle errors globally that are thrown while reducing and action
*/
const createSafeDispatcher = (store, onError) => (n) => {
  try {
    n(a);
  } catch(e){
    onError ? onError(e) :  console.error(e);
  }
}

/*
Allows dispatching thenable/Promise objects that resolve actions.
 */
const createPromiseDispatcher = (store) => (n) => (a) => {
  if (typeof(a.then) === "function"){
    return Promise.resolve(a).then(store.dispatch);
  }

  return n(a);
}

module.exports = {
  thunk: createThunk,
  logger: createLogger,
  safe: createSafeDispatcher,
  promise: createPromiseDispatcher,
}
