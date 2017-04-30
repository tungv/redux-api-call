import { createAPIMiddleware } from '../middleware';
import { CALL_API } from '../constants';

describe('createAPIMiddleware()', () => {
  it('should take an adapter and return a middleware', () => {
    const result = {};
    const fetcher = jest.fn(async () => result);
    const adapter = jest.fn(getState => fetcher);

    const middleware = createAPIMiddleware(adapter);
    const store = {
      getState: jest.fn(),
      dispatch: jest.fn()
    };

    const next = jest.fn();
    const api = {
      name: 'TEST',
      endpoint: 'test'
    };
    const action = {
      [CALL_API]: api
    }

    middleware(store)(next)(action);

    expect(adapter).toBeCalledWith(store.getState);
    expect(fetcher).toBeCalledWith(api);
    expect(next).not.toBeCalled();

    const firstAction = store.dispatch.mock.calls[0][0];

    expect(firstAction.type).toBe('@@api/FETCH_START');
  });
});
