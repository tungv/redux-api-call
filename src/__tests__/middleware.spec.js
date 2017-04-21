import configureStore from 'redux-mock-store';
import timekeeper from 'timekeeper';
import fetchMock from 'fetch-mock';
import {
  CALL_API,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE,
  ACTION_FETCH_START,
} from '../constants';
import middleware from '../middleware';
import {
  Observable
} from 'rxjs';
import { map } from 'rxjs/operator/map';

const NOW = 1478329954380;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 300

describe('middleware', () => {
  it('should be a function', () => {
    expect(middleware).toBeInstanceOf(Function);
  });

  afterEach(() => {
    fetchMock.restore();
  })

  beforeAll(() => {
    timekeeper.freeze(NOW);
  });

  afterAll(() => {
    timekeeper.reset();
  });

  const getStore = (initialState = {}) => {
    const mockStore = configureStore([middleware()]);
    return mockStore(initialState);
  };

  const takeActionsUntil = ({ subscribe, getActions }, count) => {
    return new Promise(resolve => {
      subscribe(() => {
        const actions = getActions();
        if (actions.length === count) {
          resolve(actions);
        }
      });
    });
  };

  context('rejected fetch requests', () => {
    beforeEach(() => {
      fetchMock.mock('http://localhost:3000/api/test', {
        throws: new Error('timeout')
      });
    });

    it('should dispatch FETCH_FAILURE', async () => {
      const store = getStore();
      store.dispatch({
        [CALL_API]: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
        }
      });

      const actions = await takeActionsUntil(store, 2);
      expect(actions[1].type).toEqual(ACTION_FETCH_FAILURE);
    });
  })

  context('dispatching start action', () => {
    beforeEach(() => {
      fetchMock.mock('http://localhost:3000/api/test', { everything: 'ok' });
    });

    it('should dispatch FETCH_START action immediately', () => {
      const store = getStore();
      store.dispatch({
        [CALL_API]: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
        }
      });

      const actions = store.getActions();
      expect(actions.length === 1);
      expect(actions[0]).toEqual({
        type: ACTION_FETCH_START,
        payload: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
          requestedAt: NOW,
        },
      });
    });

    it('should dispatch FETCH_START with config resolved from selectors', () => {
      const store = getStore({ some: 'state' });
      const endpointSelector = jest.fn();
      const headersSelector = jest.fn();
      const bodySelector = jest.fn();

      store.dispatch({
        [CALL_API]: {
          name: 'TEST_API',
          endpoint: endpointSelector,
          headers: headersSelector,
          body: bodySelector,
        }
      });

      expect(endpointSelector).toBeCalledWith({ some: 'state' });
      expect(headersSelector).toBeCalledWith({ some: 'state' });
      expect(bodySelector).toBeCalledWith({ some: 'state' });
    });

    it('should dispatch FETCH_START with error=true when name is not a string', () => {
      const store = getStore();
      store.dispatch({
        [CALL_API]: {
          name: {},
          endpoint: 'http://localhost:3000/api/test',
        }
      });

      expect(store.getActions()[0].error).toBeTruthy();
    });

    xit('should dispatch FETCH_START with error=true when name is an empty string', () => {
      const store = getStore();
      store.dispatch({
        [CALL_API]: {
          name: '',
          endpoint: 'http://localhost:3000/api/test',
        }
      });

      expect(store.getActions()[0].error).toBeTruthy();
    });

    it('should dispatch FETCH_START with error=true when endpoint is not a string or a function', () => {
      const store = getStore();
      store.dispatch({
        [CALL_API]: {
          name: 'TEST_API',
          endpoint: {},
        }
      });

      expect(store.getActions()[0].error).toBeTruthy();
    });
  })

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  context('multiple api calls', () => {
    it('should not drop pending request when there is a new one', async () => {
      const store = getStore();

      fetchMock.mock(
        'http://localhost:3000/api/test/1',
        delay(30).then(() => ({ body: { timer: '30' }}))
      );
      fetchMock.mock(
        'http://localhost:3000/api/test/2',
        delay(10).then(() => ({ body: { timer: '10' }}))
      );

      store.dispatch({
        [CALL_API]: {
          name: 'TEST_API_30',
          endpoint: 'http://localhost:3000/api/test/1',
        }
      });
      store.dispatch({
        [CALL_API]: {
          name: 'TEST_API_10',
          endpoint: 'http://localhost:3000/api/test/2',
        }
      });

      const [start30, start10, complete10, complete30] = await takeActionsUntil(store, 4);

      expect(start30.type).toBe(ACTION_FETCH_START);
      expect(start10.type).toBe(ACTION_FETCH_START);

      expect(complete10.type).toBe(ACTION_FETCH_COMPLETE);
      expect(complete30.type).toBe(ACTION_FETCH_COMPLETE);

      expect(complete10.payload.json).toEqual({ timer: '10' });
      expect(complete30.payload.json).toEqual({ timer: '30' });
    });

    it('should drop pending request when there is a new one', async () => {
      const store = getStore();

      fetchMock.mock(
        'http://localhost:3000/api/test/1',
        delay(30).then(() => ({ body: { timer: '30' }}))
      );
      fetchMock.mock(
        'http://localhost:3000/api/test/2',
        delay(10).then(() => ({ body: { timer: '10' }}))
      );

      store.dispatch({
        [CALL_API]: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test/1',
        }
      });
      store.dispatch({
        [CALL_API]: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test/2',
        }
      });

      await delay(50);
      const actions = store.getActions();
      expect(actions.length).toBe(3);
      const [start30, start10, complete10] = actions;

      expect(start30.type).toBe(ACTION_FETCH_START);
      expect(start10.type).toBe(ACTION_FETCH_START);
      expect(complete10.type).toBe(ACTION_FETCH_COMPLETE);
      expect(complete10.payload.json).toEqual({ timer: '10' });
    });
  });

  context('dispatching complete action', () => {
    it('should dispatch FETCH_COMPLETE with a json object', async () => {
      const store = getStore();
      const mockSpy = jest.fn();
      fetchMock.mock('http://localhost:3000/api/test', () => {
        mockSpy();
        return ({ everything: 'ok' });
      });

      store.dispatch({
        [CALL_API]: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
        }
      });

      const [_, complete] = await takeActionsUntil(store, 2);
      expect(mockSpy).toHaveBeenCalledTimes(1);

      expect(complete).toEqual({
        type: ACTION_FETCH_COMPLETE,
        payload: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          json: {
            everything: 'ok'
          }
        },
      });
    });

    xit('should dispatch FETCH_COMPLETE with a text object', async () => {
      const store = getStore();
      fetchMock.mock('http://localhost:3000/api/test', { body: 'string' });

      store.dispatch({
        [CALL_API]: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
        }
      });

      const [_, complete] = await takeActionsUntil(store, 2);

      expect(complete).toEqual({
        type: ACTION_FETCH_COMPLETE,
        payload: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          text: 'string',
        },
      });
    });
  });

  context('dispatching failure action', () => {
    it('should dispatch FETCH_FAILURE with a json object', async () => {
      const store = getStore();
      fetchMock.mock('http://localhost:3000/api/test', { status: 404, body: { msg: 'ERRRRR!' }});
      store.dispatch({
        [CALL_API]: {
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
        }
      });

      const [_, failure] = await takeActionsUntil(store, 2);
      expect(failure).toEqual({
        type: ACTION_FETCH_FAILURE,
        payload: {
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          json: {
            msg: 'ERRRRR!',
          }
        },
      })
    });

    xit('should dispatch FETCH_FAILURE with a error object', async () => {
      const store = getStore();
      fetchMock.mock('http://localhost:3000/api/test', { status: 404, body: 'just a message' });
      store.dispatch({
        [CALL_API]: {
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
        }
      });

      const [_, failure] = await takeActionsUntil(store, 2);
      expect(failure).toEqual({
        type: ACTION_FETCH_FAILURE,
        payload: {
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          error: 'just a message',
        },
      });
    });
  });
});
