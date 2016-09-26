import {
  ACTION_FETCH_START,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE,
} from './constants';
import handleActions from './utils/handleActions';

const getName = action => action.payload.name;
const getRequestedAt = action => action.payload.requestedAt;
const getRespondedAt = action => action.payload.respondedAt;
const getJSONResponse = action => action.payload.json;
const getError = action => action.payload.error;

const reducer = handleActions({
  [ACTION_FETCH_START]: (state, action) => {
    const apiName = getName(action);
    const api = state[apiName];
    const next = {
      ...api,
      lastRequest: getRequestedAt(action),
      isFetching: !action.error,
      isInvalidated: true,
      error: action.error ? getError(action) : null,
    };

    return {
      ...state,
      [apiName]: next,
    };
  },
  [ACTION_FETCH_COMPLETE]: (state, action) => {
    const apiName = getName(action);
    const api = state[apiName];
    const next = {
      ...api,
      isFetching: false,
      isInvalidated: false,
      lastResponse: getRespondedAt(action),
      data: getJSONResponse(action),
      error: null,
    };

    return {
      ...state,
      [apiName]: next,
    };
  },
  [ACTION_FETCH_FAILURE]: (state, action) => {
    const apiName = getName(action);
    const api = state[apiName];
    const next = {
      ...api,
      isFetching: false,
      isInvalidated: true,
      error: getJSONResponse(action),
    };

    return {
      ...state,
      [apiName]: next,
    };
  },
});

export default reducer;
