/*
Allows passing a function to a dispatch call that receivees a dispatcher and the current state as arguments.
This allows you to execute asynchronous calls and dispatch as they are executed
*/
const createThunk = ({dispatch, getState}) => n => a =>
  (typeof(a) === "function") ? a(dispatch, getState()) : n(a)

/*
Logs actions before they are dispatched
*/
const createLogger = ({ getState })  => n => a => {
  const previous = getState();
  n(a);
  const newState = getState();
  console.groupCollapsed(`ACTION: ${a.type}`);
  console.log('Action:', a);
  console.log('Previous:', previous);
  console.log('Current:', newState);
  console.groupEnd();
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
const createPromiseDispatcher = ({ dispatch }) => n => a => {
  if (typeof(a.then) === "function"){
    return Promise.resolve(a).then(dispatch);
  }

  return n(a);
}

module.exports = {
  thunk: createThunk,
  logger: createLogger,
  safe: createSafeDispatcher,
  promise: createPromiseDispatcher,
}
