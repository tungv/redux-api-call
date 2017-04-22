import { Subject } from 'rxjs/Subject';
import defaultCreateAdapter from './defaultAdapter'
import createActionStream from './createActionStream'
import { CALL_API } from './constants';

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
