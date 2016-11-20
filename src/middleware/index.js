const createThunk = store => n => a =>
  (typeof(a) === "function") ? a(store.dispatcher(), store.getState()) : n(a)

const createLogger = (store) => n => a => {
  console.log("Dispatching ", a);
  n(a);
}

const createSafeDispatcher = (store, onError) => (n) => {
  try{
    n(a);
  } catch(e){
    onError ? onError(e) :  console.error(e);
  }
}

const createPromiseDispatcher = (store) => (n) => (a) => {
  if (typeof(a.then) === "function"){
    return Promise.resolve(a).then(store.dispatcher());
  }

  return n(a);
}

module.exports = {
  thunk: createThunk,
  logger: createLogger,
  safe: createSafeDispatcher,
  promise: createPromiseDispatcher,
}
