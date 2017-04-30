import { Subject } from 'rxjs/Subject';
import composeAdapters from './composeAdapters.js';
import createActionStream from './createActionStream'
import { CALL_API } from './constants';
import fetch from 'redux-api-call-adapter-fetch';
import parseJSON from 'redux-api-call-adapter-json';

const defaultAdapter = composeAdapters(parseJSON, fetch);

export const createAPIMiddleware = (adapter) => ({ dispatch, getState }) => {
  const apiCallsAction$ = new Subject();

  const finalAdapter = adapter(getState);

  createActionStream(apiCallsAction$, { getState }, finalAdapter).subscribe(dispatch);

  return next => action => {
    if (!action[CALL_API]) {
      next(action);
      return;
    }

    apiCallsAction$.next(action);
  };
}


// middleware
export default createAPIMiddleware(defaultAdapter)
