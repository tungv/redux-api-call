import assertTypes from './utils/assertTypes'

export const validateApi = api => {
  assertTypes(
    api.name,
    /string/,
    'name must be a string');

  assertTypes(
    api.endpoint,
    /string|function/,
    'endpoint must be either a string or a function'
  );
};
