export default (array, defaulValue) => state => {
  const finalValue = array.reduce((value, nextProp) => {
    if (typeof value === 'undefined' || value === null) {
      return;
    }
    return value[nextProp];
  }, state);

  if (typeof finalValue === 'undefined') {
    return defaulValue;
  }

  return finalValue;
};
