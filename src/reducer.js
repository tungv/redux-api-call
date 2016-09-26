import {
  ACTION_FETCH_START,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE,
} from './constants';
import { handleActions } from 'redux-actions';

const getName = action => action.payload.name;
const getRequestedAt = action => action.payload.requestedAt;
const getError = action => action.payload.error;

const reducer = handleActions({
  [ACTION_FETCH_START]: (state, action) => {
    const apiName = getName(action);
    const api = state[apiName];
    const next = {
      ...api,
      lastRequest: getRequestedAt(action),
      isFetching: !action.error,
      invalidated: true,
      error: action.error ? getError(action) : null,
    };

    return {
      ...state,
      [apiName]: next,
    };
  },
}, {});

export default reducer;
