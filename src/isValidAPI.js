const isString = f => typeof f === 'string';
const isFunction = f => typeof f === 'function';
const isFunctionOrString = f => isFunction(f) || isString(f);

export default api => {
  const nameOk = isString(api.name);
  const endpointOk = isFunctionOrString(api.endpoint);
  return nameOk && endpointOk;
};
