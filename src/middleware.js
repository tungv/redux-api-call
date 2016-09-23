import {
  CALL_API,
  ACTION_FETCH_START,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE
} from './constants';
import isValidAPI from './isValidAPI.js';

const makeSuccessAction = api => (json) => ({
  type: ACTION_FETCH_COMPLETE,
  payload: {
    ...api,
    json,
    timestamp: Date.now(),
  },
});

const makeFailureAction = api => json => ({
  type: ACTION_FETCH_FAILURE,
  payload: {
    ...api,
    json,
    timestamp: Date.now(),
  },
});

export default (adapter) => ({ dispatch, getState }) => next => action => {
  if (!action || !action[CALL_API]) {
    next(action);
    return;
  }

  const api = action[CALL_API];
  if (!isValidAPI(api)) {
    dispatch({
      type: ACTION_FETCH_START,
      error: true,
      payload: {
        error: 'action[CALL_API] is invalid',
        api,
      },
    });
    return;
  }

  // valid api
  // TODO: wrap all functions with getState()
  const startAction = {
    type: ACTION_FETCH_START,
    payload: api
  }

  dispatch(startAction);

  // sending request
  return new Promise((resolve, reject) => {
    const response = adapter(api);

    response.then(resp => {
      if (resp.ok) {
        return resp.json().then(makeSuccessAction(api));
      }

      return resp.json().then(makeFailureAction(api));
    })
    .then(dispatch)
    .then(resolve);
  });
}
