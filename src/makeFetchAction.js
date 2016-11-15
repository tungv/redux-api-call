import get from './utils/get';
import { CALL_API, REDUCER_PATH, ACTION_UPDATE_LOCAL } from './constants';

export default (apiName, apiConfigFn, selectorDescriptor = {}) => {
  const actionCreator = (...params) => ({
    [CALL_API]: {
      ...apiConfigFn(...params),
      name: apiName,
    },
  });

  const updater = data => ({
    type: ACTION_UPDATE_LOCAL,
    payload: {
      name: apiName,
      data,
    },
  });

  const isFetchingSelector = get([REDUCER_PATH, apiName, 'isFetching'], false);
  const isInvalidatedSelector = get([REDUCER_PATH, apiName, 'isInvalidated'], false);
  const dataSelector = get([REDUCER_PATH, apiName, 'data'], null);
  const errorSelector = get([REDUCER_PATH, apiName, 'error'], null);

  return {
    actionCreator,
    updater,
    isFetchingSelector,
    isInvalidatedSelector,
    dataSelector,
    errorSelector,
  };
};
