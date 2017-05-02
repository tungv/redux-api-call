import handleActions from '../handleActions'

describe('handleActions()', () => {
  it('should call the correct action', () => {
    const handlers = {
      ACTION1: jest.fn(),
      ACTION2: jest.fn(),
    };

    const reducer = handleActions(handlers);
    const action = { type: 'ACTION1', payload: 'test' };
    reducer({}, action);
    expect(handlers.ACTION1).toHaveBeenCalledWith({}, action);
    expect(handlers.ACTION2).not.toHaveBeenCalled();
  });

  it('should ignore non-function handler', () => {
    const handlers = {
      ACTION1: {},
    };

    const reducer = handleActions(handlers);
    const action = { type: 'ACTION1', payload: 'test' };
    const state = {};
    expect(reducer(state, action)).toBe(state);
  });

  it('should set default state ', () => {
    const handlers = {
      ACTION1: jest.fn(),
    };

    const reducer = handleActions(handlers);
    const action = { type: 'ACTION1', payload: 'test' };
    reducer(undefined, action)
    expect(handlers.ACTION1).toHaveBeenCalledWith({}, action);
  });
})
