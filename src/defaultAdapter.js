import fetch from './adapters/fetch'
import parseJSON from './adapters/parseJSON';

const composeAdatpers = (...adapters) => {
  const reversed = adapters.reverse();
  const head = reversed[0];
  const tail = reversed.slice(1);

  return getState => tail.reduce(
    (acc, current) => current(acc, getState),
    head(x => x, getState)
  );
}


export default composeAdatpers(parseJSON, fetch);
