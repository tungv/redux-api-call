import { CALL_API } from './constants';
import { validateApi } from './validateApi.js';
import defaultAdapter from './defaultAdapter'
import {
  makeStartAction,
  makeStartErrorAction,
  makeSuccessAction,
  makeFailureAction,
} from './actions'

export default (adapter = defaultAdapter) => ({ dispatch, getState }) => next => action => {
  if (!action || !action[CALL_API]) {
    next(action);
    return;
  }

  const api = action[CALL_API];
  try {
    validateApi(api);

    // valid api
    // TODO: wrap all functions with getState()
    const finalApi = api;
    dispatch(makeStartAction(finalApi)());

    // sending request
    return new Promise((resolve, reject) => {
      const responsePromise = adapter(api);

      responsePromise.then(resp => {
        if (resp.ok) {
          return resp.json().then(makeSuccessAction(api));
        }

        return resp.json().then(makeFailureAction(api));
      })
      .then(dispatch)
      .then(resolve);
    });
  } catch (error) {
    dispatch(makeStartErrorAction(api)(error));
    return;
  }
}
