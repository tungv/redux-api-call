import { Subject } from 'rxjs/Subject';
import defaultAdapter from './defaultAdapter'
import createActionStream from './createActionStream'
import { CALL_API } from './constants';

// middleware
export default (adapter = defaultAdapter) => ({ dispatch, getState }) => {
  const apiCallsAction$ = new Subject();

  createActionStream(apiCallsAction$, { getState }, adapter).subscribe(dispatch);

  return next => action => {
    if (!action[CALL_API]) {
      next(action);
      return;
    }

    apiCallsAction$.next(action);
  };
}
