import get from './utils/get';
import assertTypes from './utils/assertTypes'
import { CALL_API, REDUCER_PATH } from './constants';

const makeSelectors = (descriptors, dataSelector) => {
  const keys = Object.keys(descriptors);
  const selectors = {};
  keys.forEach(key => {
    const fn = descriptors[key];
    assertTypes(fn, /function/, `selector for "${key}" must be a function`);
    selectors[key + 'Selector'] = state => fn(dataSelector(state));
  });
  return selectors;
};

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

  const otherSelectors = makeSelectors(selectorDescriptor, dataSelector);

  return {
    actionCreator,
    ...otherSelectors,
    isFetchingSelector,
    isInvalidatedSelector,
    dataSelector,
    errorSelector,
  };
};
