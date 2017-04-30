export default (handlers) => (state = {}, action) => {
  const handler = handlers[action.type];
  if (typeof handler !== 'function') {
    return state;
  }

  return handler(state, action);
}
