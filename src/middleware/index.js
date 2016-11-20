module.exports = {
  async: createAsyncMiddleware,
  logger: createLoggerMiddleware,
}

function createAsyncMiddleware(store){
  return n => a => {
    if (typeof(a) === "function"){
      const { dispatcher } = store;
      a(dispatcher());
      return;
    }

    n(a);
  }
}

function createLoggerMiddleware(store) {
    return n => a => {
      console.log("Dispatching ", a);
      n(a);
    }
}
