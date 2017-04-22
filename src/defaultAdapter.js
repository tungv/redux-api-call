import fetch from './adapters/fetch'
import parseJSON from './adapters/parseJSON';

const composeAdatpers = (...adapters) => {
  const reversed = adapters.reverse();
  const head = reversed[0];
  const tail = reversed.slice(1);

  const chain = getState => tail.reduce(
    (acc, current) => current(acc, getState),
    head(null, getState)
  );

  return (getState) => async (req) => {
    return chain(getState)(req);
  }
}


export default composeAdatpers(parseJSON, fetch);
