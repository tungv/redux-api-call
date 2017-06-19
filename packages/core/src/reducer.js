import {
  ACTION_FETCH_START,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE,
  ACTION_UPDATE_LOCAL,
  ACTION_RESET_LOCAL,
} from './constants';
import handleActions from './utils/handleActions';

const getName = action => action.payload.name;
const getRequestedAt = action => action.payload.requestedAt;
const getRespondedAt = action => action.payload.respondedAt;
const getJSONResponse = action => action.payload.json;
const getError = action => action.payload.error;
const getPreviousError = (state, action) => state[getName(action)] ? state[getName(action)].error : null;

const includeString = (element, array) => array.indexOf(element) !== -1;
const resetOrKeepValue = (field, action, currentData) => (
  includeString(field, action.payload.data) ? undefined : currentData[field]
);


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
      error: action.error ? getError(action) : getPreviousError(state, action),
    }),
  [ACTION_FETCH_COMPLETE]: (state, action) => updateWith(
    state,
    getName(action), {
      isFetching: false,
      isInvalidated: false,
      lastResponse: getRespondedAt(action),
      data: getJSONResponse(action),
      error: null,
      headers: action.meta,
    }),
  [ACTION_FETCH_FAILURE]: (state, action) => updateWith(
    state,
    getName(action), {
      isFetching: false,
      isInvalidated: true,
      error: getJSONResponse(action),
      headers: action.meta,
    }),
  [ACTION_UPDATE_LOCAL]: (state, action) => updateWith(
    state,
    getName(action), {
      data: action.payload.data,
    }),
  [ACTION_RESET_LOCAL]: (state, action) => {
    const name = getName(action);
    const currentData = state[name] || {};
    return updateWith(
      state,
      name,
      {
        lastRequest: resetOrKeepValue('lastRequest', action, currentData),
        isFetching: resetOrKeepValue('isFetching', action, currentData),
        isInvalidated: resetOrKeepValue('isInvalidated', action, currentData),
        lastResponse: resetOrKeepValue('lastResponse', action, currentData),
        data: resetOrKeepValue('data', action, currentData),
        error: resetOrKeepValue('error', action, currentData),
      }
    );
  },
});

export default reducer;
