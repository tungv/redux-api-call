import { Subject } from 'rxjs/Subject';
import composeAdapters from './composeAdapters.js';
import createActionStream from './createActionStream'
import { CALL_API } from './constants';
import fetch from './adapters/fetch'
import parseJSON from './adapters/parseJSON';

const defaultCreateAdapter = composeAdapters(parseJSON, fetch);

// middleware
export default (createAdapter = defaultCreateAdapter) => ({ dispatch, getState }) => {
  const apiCallsAction$ = new Subject();

  const finalAdapter = createAdapter(getState);

  createActionStream(apiCallsAction$, { getState }, finalAdapter).subscribe(dispatch);

  return next => action => {
    if (!action[CALL_API]) {
      next(action);
      return;
    }

    apiCallsAction$.next(action);
  };
}
