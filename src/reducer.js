import {
  ACTION_FETCH_START,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE,
  ACTION_UPDATE_LOCAL,
} from './constants';
import handleActions from './utils/handleActions';

const getName = action => action.payload.name;
const getRequestedAt = action => action.payload.requestedAt;
const getRespondedAt = action => action.payload.respondedAt;
const getJSONResponse = action => action.payload.json;
const getError = action => action.payload.error;

const updateWith = (state, name, obj) => ({
  ...state,
  [name]: {
    ...state[name],
    ...obj,
  },
});

const reducer = handleActions({
  [ACTION_FETCH_START]: (state, action) => updateWith(
    state,
    getName(action), {
      lastRequest: getRequestedAt(action),
      isFetching: !action.error,
      isInvalidated: true,
      error: action.error ? getError(action) : null,
    }),
  [ACTION_FETCH_COMPLETE]: (state, action) => updateWith(
    state,
    getName(action), {
      isFetching: false,
      isInvalidated: false,
      lastResponse: getRespondedAt(action),
      data: getJSONResponse(action),
      error: null,
    }),
  [ACTION_FETCH_FAILURE]: (state, action) => updateWith(
    state,
    getName(action), {
      isFetching: false,
      isInvalidated: true,
      error: getJSONResponse(action),
    }),
  [ACTION_UPDATE_LOCAL]: (state, action) => updateWith(
    state,
    getName(action), {
      data: action.payload.data,
    }),
});

export default reducer;
