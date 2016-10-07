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

    const finalApi = Object.keys(api).reduce((obj, key) => ({
      ...obj,
      [key]: typeof api[key] === 'function' ? api[key](getState()) : api[key],
    }), {});

    validateApi(finalApi);

    dispatch(makeStartAction(finalApi)());

    // sending request
    return new Promise((resolve, reject) => {
      const responsePromise = adapter(finalApi);

      responsePromise.then(resp => {
        if (resp.ok) {
          return resp.json().then(makeSuccessAction(finalApi));
        }

        return resp.json().then(makeFailureAction(finalApi));
      })
      .then(dispatch)
      .then(resolve);
    });
  } catch (error) {
    dispatch(makeStartErrorAction(api)(error));
    return;
  }
}
