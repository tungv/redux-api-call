const reduceKeys = (obj) => (reducer, seed) => Object.keys(obj).reduce((acc, key) => ({
  ...acc,
  ...reducer(obj, key),
}), seed);

const bindFunction = (getState) => (obj, key) => ({
  [key]: typeof obj[key] === 'function' ? obj[key](getState()) : obj[key],
});

export default (getState) => (api) => reduceKeys(api)(bindFunction(getState), {});
