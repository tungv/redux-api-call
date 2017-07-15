import fetch from 'redux-api-call-adapter-fetch';
import parseJSON from 'redux-api-call-adapter-json';
import dedupe from 'redux-api-call-adapter-dedupe';

import {
  makeFailureAction,
  makeStartAction,
  makeStartErrorAction,
  makeSuccessAction,
} from './actions';
import applyFunctions from './utils/applyFunctions';
import composeAdapters from './composeAdapters.js';
import { CALL_API } from './constants';

const defaultAdapter = composeAdapters(parseJSON, dedupe, fetch);

export function createAPIMiddleware(adapter) {
  return ({ dispatch, getState }) => {
    const finalAdapter = adapter(getState);
    const resolveState = applyFunctions(getState);

    return next => async action => {
      if (!action[CALL_API]) {
        next(action);
        return;
      }

      const rawRequest = action[CALL_API];
      const request = resolveState(rawRequest);

      if (typeof request.name !== 'string') {
        dispatch(makeStartErrorAction({ ...request, error: 'no api name is specified' }));
        return;
      }
      if (typeof request.endpoint !== 'string') {
        dispatch(makeStartErrorAction({ ...request, error: 'no api endpoint is specified' }));
        return;
      }

      dispatch(makeStartAction(request));

      try {
        const response = await finalAdapter(request);
        dispatch(makeSuccessAction(request, response));
      } catch (failure) {
        dispatch(makeFailureAction(request, failure));
      }
    };
  };
}

// middleware
export default createAPIMiddleware(defaultAdapter);
