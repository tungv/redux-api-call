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
const isValid = api =>
  typeof api.name === 'string' && typeof api.endpoint === 'string';

export const createAPIMiddleware = adapter => ({ dispatch, getState }) => {
  const finalAdapter = adapter(getState);
  const resolveState = applyFunctions(getState);

  return next => async action => {
    if (!action[CALL_API]) {
      next(action);
      return;
    }

    const rawRequest = action[CALL_API];
    const request = resolveState(rawRequest);

    if (!isValid(request)) {
      dispatch(makeStartErrorAction(request)());
      return;
    }

    dispatch(makeStartAction(request)());

    try {
      const response = await finalAdapter(request);
      if (response) {
        dispatch(makeSuccessAction(request)(response.payload, response.meta));
      }
    } catch (failure) {
      dispatch(makeFailureAction(request)(failure.payload, failure.meta));
    }
  };
};

// middleware
export default createAPIMiddleware(defaultAdapter);
