import { ACTION_FETCH_START } from '../constants';
import { createAPIMiddleware } from '../middleware';

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
      endpoint: 'test',
      requestedAt: 1478329954380
    };
    const action = {
      type: ACTION_FETCH_START,
      payload: api
    }

    middleware(store)(next)(action);

    expect(adapter).toBeCalledWith(store.getState);
    expect(fetcher).toBeCalledWith(api);
    expect(store.dispatch).not.toBeCalled();

    const firstAction = next.mock.calls[0][0];

    expect(firstAction.type).toBe('@@api/FETCH_START');
  });
});
