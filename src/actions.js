import {
  CALL_API,
  ACTION_FETCH_START,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE
} from './constants';

export const makeStartErrorAction = api => (error) => ({
  type: ACTION_FETCH_START,
  error: true,
  payload: {
    error,
    api,
  },
});

export const makeStartAction = api => () => ({
  type: ACTION_FETCH_START,
  payload: api,
});

export const makeSuccessAction = api => (json) => ({
  type: ACTION_FETCH_COMPLETE,
  payload: {
    ...api,
    json,
    timestamp: Date.now(),
  },
});

export const makeFailureAction = api => json => ({
  type: ACTION_FETCH_FAILURE,
  payload: {
    ...api,
    json,
    timestamp: Date.now(),
  },
});
