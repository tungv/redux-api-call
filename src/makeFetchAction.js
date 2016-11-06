import get from './utils/get';
import { CALL_API, REDUCER_PATH } from './constants';

export default (apiName, apiConfigFn, selectorDescriptor = {}) => {
  const actionCreator = (...params) => ({
    [CALL_API]: {
      ...apiConfigFn(...params),
      name: apiName,
    },
  });

  const isFetchingSelector = get([REDUCER_PATH, apiName, 'isFetching'], false);
  const isInvalidatedSelector = get([REDUCER_PATH, apiName, 'isInvalidated'], false);
  const dataSelector = get([REDUCER_PATH, apiName, 'data'], null);
  const errorSelector = get([REDUCER_PATH, apiName, 'error'], null);

  return {
    actionCreator,
    isFetchingSelector,
    isInvalidatedSelector,
    dataSelector,
    errorSelector,
  };
};
