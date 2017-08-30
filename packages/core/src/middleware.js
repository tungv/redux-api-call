import dedupe from 'redux-api-call-adapter-dedupe';
import fetch from 'redux-api-call-adapter-fetch';
import parseJSON from 'redux-api-call-adapter-json';

import { ACTION_FETCH_START } from './constants';
import {
  makeFailureAction,
  makeStartErrorAction,
  makeSuccessAction,
} from './actions';
import applyFunctions from './utils/applyFunctions';
import composeAdapters from './composeAdapters.js';

const defaultAdapter = composeAdapters(parseJSON, dedupe, fetch);

function validate(request) {
  if (typeof request.name !== 'string') {
    return makeStartErrorAction({
      ...request,
      error: 'no api name is specified',
    });
  }
  if (typeof request.endpoint !== 'string') {
    return makeStartErrorAction({
      ...request,
      error: 'no api endpoint is specified',
    });
  }
  return false;
}

async function tryRequest(request, adapter) {
  try {
    const response = await adapter(request);
    return makeSuccessAction(request, response);
  } catch (failure) {
    return makeFailureAction(request, failure);
  }
}

export function createAPIMiddleware(adapter) {
  return ({ dispatch, getState }) => {
    const finalAdapter = adapter(getState);
    const resolveState = applyFunctions(getState);

    return next => async action => {
      let request;
      if (action.type === ACTION_FETCH_START) {
        request = resolveState(action.payload);

        const errorAction = validate(request);
        if (errorAction) {
          next(errorAction);
          return;
        }
      }

      if (request) {
        next({ ...action, payload: request });
      } else {
        next(action);
      }

      if (action.type !== ACTION_FETCH_START) return;

      dispatch(await tryRequest(request, finalAdapter));
    };
  };
}

// middleware
export default createAPIMiddleware(defaultAdapter);
