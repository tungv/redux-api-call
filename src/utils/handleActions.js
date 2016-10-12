export default (handlers) => (state = {}, action) => {
  const handler = handlers[action.type];
  /* istanbul ignore if */
  if (typeof handler !== 'function') {
    return state;
  }

  return handler(state, action);
}
