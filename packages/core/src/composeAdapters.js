const compose = (...adapters) => {
  if (adapters.length === 0) {
    throw new Error('redux-api-call: composeAdatpers must take at least one adapter')
  }
  const reversed = adapters.reverse();
  const head = reversed[0];
  const tail = reversed.slice(1);

  return getState => tail.reduce(
    (acc, current) => current(acc, getState),
    head(x => x, getState)
  );
}

export default compose;
