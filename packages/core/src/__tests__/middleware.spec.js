import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import timekeeper from 'timekeeper';

import {
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE,
  ACTION_FETCH_START,
} from '../constants';
import middleware from '../middleware';

const NOW = 1478329954380;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 300;

describe('default middleware', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  beforeAll(() => {
    timekeeper.freeze(NOW);
  });

  afterAll(() => {
    timekeeper.reset();
  });

  const getStore = (initialState = {}) => {
    const mockStore = configureStore([middleware]);
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

  describe('rejected fetch requests', () => {
    beforeEach(() => {
      fetchMock.mock('http://localhost:3000/api/test', {
        throws: new Error('timeout'),
      });
    });

    it('should dispatch FETCH_FAILURE', async () => {
      const store = getStore();
      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
        },
      });

      const actions = await takeActionsUntil(store, 2);
      expect(actions[1].type).toEqual(ACTION_FETCH_FAILURE);
    });
  });

  describe('dispatching start action', () => {
    beforeEach(() => {
      fetchMock.mock('http://localhost:3000/api/test', { everything: 'ok' });
    });

    it('should dispatch FETCH_START action immediately', () => {
      const store = getStore();
      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
        },
      });

      const actions = store.getActions();
      expect(actions.length === 1);
      expect(actions[0]).toEqual({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
          requestedAt: NOW,
        },
      });
    });

    it('should dispatch FETCH_START with config resolved from selectors', () => {
      const store = getStore({ some: 'state' });
      const endpointSelector = jest.fn(x => 'http://localhost:3000/api/test');
      const headersSelector = jest.fn(x => ({ key: 'value' }));
      const bodySelector = jest.fn(x => 'somebody');

      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: endpointSelector,
          headers: headersSelector,
          body: bodySelector,
        },
      });

      expect(endpointSelector).toBeCalledWith({ some: 'state' });
      expect(headersSelector).toBeCalledWith({ some: 'state' });
      expect(bodySelector).toBeCalledWith({ some: 'state' });
      const [startAction] = store.getActions();
      expect(startAction).toEqual({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
          headers: { key: 'value' },
          body: 'somebody',
        },
      });
    });

    it('should dispatch FETCH_START with error=true when name is not a string', () => {
      const store = getStore();
      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: {},
          endpoint: 'http://localhost:3000/api/test',
        },
      });

      expect(store.getActions()[0].error).toBeTruthy();
    });

    xit(
      'should dispatch FETCH_START with error=true when name is an empty string',
      () => {
        const store = getStore();
        store.dispatch({
          type: ACTION_FETCH_START,
          payload: {
            requestedAt: 1478329954380,
            name: '',
            endpoint: 'http://localhost:3000/api/test',
          },
        });

        expect(store.getActions()[0].error).toBeTruthy();
      }
    );

    it('should dispatch FETCH_START with error=true when endpoint is not a string or a function', () => {
      const store = getStore();
      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: {},
        },
      });

      expect(store.getActions()[0].error).toBeTruthy();
    });
  });

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  describe('multiple api calls', () => {
    it('should not drop pending request when there is a new one', async () => {
      const store = getStore();

      fetchMock.mock(
        'http://localhost:3000/api/test/1',
        delay(30).then(() => ({ body: { timer: '30' } }))
      );
      fetchMock.mock(
        'http://localhost:3000/api/test/2',
        delay(10).then(() => ({ body: { timer: '10' } }))
      );

      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API_30',
          endpoint: 'http://localhost:3000/api/test/1',
        },
      });
      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API_10',
          endpoint: 'http://localhost:3000/api/test/2',
        },
      });

      const [start30, start10, complete10, complete30] = await takeActionsUntil(
        store,
        4
      );

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
        delay(30).then(() => ({ body: { timer: '30' } }))
      );
      fetchMock.mock(
        'http://localhost:3000/api/test/2',
        delay(10).then(() => ({ body: { timer: '10' } }))
      );

      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test/1',
        },
      });
      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test/2',
        },
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

  describe('dispatching complete action', () => {
    it('should dispatch FETCH_COMPLETE with a json object', async () => {
      const store = getStore();
      const mockSpy = jest.fn();
      fetchMock.mock('http://localhost:3000/api/test', () => {
        mockSpy();
        return { everything: 'ok' };
      });

      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
        },
      });

      const [_, complete] = await takeActionsUntil(store, 2);
      expect(mockSpy).toHaveBeenCalledTimes(1);

      expect(complete).toEqual({
        type: ACTION_FETCH_COMPLETE,
        payload: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          requestedAt: NOW,
          json: {
            everything: 'ok',
          },
        },
        meta: {},
      });
    });

    it('should dispatch FETCH_COMPLETE with a text object', async () => {
      const store = getStore();
      fetchMock.mock('http://localhost:3000/api/test', { body: 'string' });

      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
        },
      });

      const [_, complete] = await takeActionsUntil(store, 2);

      expect(complete).toEqual({
        type: ACTION_FETCH_COMPLETE,
        payload: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          requestedAt: NOW,
          json: 'string',
        },
        meta: {},
      });
    });

    it('should dispatch FETCH_COMPLETE with a normalized meta object', async () => {
      const store = getStore();
      fetchMock.mock('http://localhost:3000/api/test', {
        body: 'string',
        headers: { 'X-CHECKSUM': 'value' },
      });

      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
        },
      });

      const [_, complete] = await takeActionsUntil(store, 2);

      expect(complete).toEqual({
        type: ACTION_FETCH_COMPLETE,
        payload: {
          name: 'TEST_API',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          requestedAt: NOW,
          json: 'string',
        },
        meta: {
          'x-checksum': 'value',
        },
      });
    });
  });

  describe('dispatching failure action', () => {
    it('should dispatch FETCH_FAILURE when fetch throw an error', async () => {
      const store = getStore();
      fetchMock.mock('http://localhost:3000/api/test', {
        throws: new Error('fetch failed'),
      });
      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
        },
      });
      const [_, failure] = await takeActionsUntil(store, 2);
      expect(failure).toEqual({
        type: ACTION_FETCH_FAILURE,
        meta: {},
        payload: {
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          requestedAt: NOW,
          json: new Error('fetch failed'),
        },
      });
    });

    it('should dispatch FETCH_FAILURE with a json object', async () => {
      const store = getStore();
      fetchMock.mock('http://localhost:3000/api/test', {
        status: 404,
        body: { msg: 'ERRRRR!' },
      });
      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
        },
      });

      const [_, failure] = await takeActionsUntil(store, 2);
      expect(failure).toEqual({
        type: ACTION_FETCH_FAILURE,
        payload: {
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          requestedAt: NOW,
          json: {
            msg: 'ERRRRR!',
          },
        },
        meta: {},
      });
    });

    it('should dispatch FETCH_FAILURE with a error object', async () => {
      const store = getStore();
      fetchMock.mock('http://localhost:3000/api/test', {
        status: 404,
        body: 'just a message',
      });
      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
        },
      });

      const [_, failure] = await takeActionsUntil(store, 2);
      expect(failure).toEqual({
        type: ACTION_FETCH_FAILURE,
        meta: {},
        payload: {
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          requestedAt: NOW,
          json: 'just a message',
        },
      });
    });

    it('should dispatch FETCH_FAILURE with a normalized meta object', async () => {
      const store = getStore();
      fetchMock.mock('http://localhost:3000/api/test', {
        status: 404,
        body: 'just a message',
        headers: { 'X-SERVER': 'Express' },
      });
      store.dispatch({
        type: ACTION_FETCH_START,
        payload: {
          requestedAt: 1478329954380,
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
        },
      });

      const [_, failure] = await takeActionsUntil(store, 2);
      expect(failure).toEqual({
        type: ACTION_FETCH_FAILURE,
        payload: {
          name: 'ITS_NOT_MY_FAULT',
          endpoint: 'http://localhost:3000/api/test',
          respondedAt: NOW,
          requestedAt: NOW,
          json: 'just a message',
        },
        meta: {
          'x-server': 'Express',
        },
      });
    });
  });
});
