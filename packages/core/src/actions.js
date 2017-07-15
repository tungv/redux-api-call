import {
  ACTION_FETCH_START,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE,
} from './constants';

export const makeStartErrorAction = payload => ({
  type: ACTION_FETCH_START,
  error: true,
  payload,
});

export const makeStartAction = api => ({
  type: ACTION_FETCH_START,
  payload: {
    ...api,
    requestedAt: Date.now(),
  },
});

export const makeSuccessAction = (api, { payload, meta }) => ({
  type: ACTION_FETCH_COMPLETE,
  payload: {
    ...api,
    json: payload,
    respondedAt: Date.now(),
  },
  meta,
});

export const makeFailureAction = (api, { payload, meta }) => ({
  type: ACTION_FETCH_FAILURE,
  payload: {
    ...api,
    json: payload,
    respondedAt: Date.now(),
  },
  meta,
});
