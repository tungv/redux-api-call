import { expect } from 'chai';
import configureStore from 'redux-mock-store';
import { stub } from 'sinon';
import timekeeper from 'timekeeper';
import { CALL_API } from '../constants';
import { validateApi } from '../validateApi';
import {
  makeStartAction,
  makeStartErrorAction,
  makeSuccessAction,
  makeFailureAction,
} from '../actions';

import middleware from '../middleware';

jest.mock('../validateApi.js');
jest.mock('../actions.js');

const fakeResponse = (status, json) => Promise.resolve({
  ok: status < 400,
  status,
  json: () => Promise.resolve(json)
});

describe('middleware', () => {
  it('should be a function', () => {
    expect(middleware).to.be.a.function;
  });

  describe('with store', () => {
    const mockAdapter = stub();
    const mockStore = configureStore([middleware(mockAdapter)]);

    describe('# when CALL_API is not passed', () => {
      const store = mockStore({});
      const actions = [{
        type: 'ANYTHING',
        payload: {}
      }, {
        type: 'NO_PAYLOAD'
      }];

      it('should dispatch original actions', () => {
        actions.forEach(store.dispatch);
        expect(store.getActions()).eql(actions);
      });
    });

    describe('# when API config is invalid', () => {
      let actions;

      beforeAll(() => {
        const store = mockStore({});
        validateApi.throws(new Error('failed for some reason'));
        makeStartErrorAction.returns(error => ({ type: 'START_ERROR', payload: error }));

        store.dispatch({ [CALL_API]: {} });
        actions = store.getActions();
      });

      it('should dispatch one action created by makeStartErrorAction', () => {
        expect(actions).to.have.length(1);
        const { payload } = actions[0];
        expect(payload).to.be.an.instanceOf(Error);
        expect(payload).to.have.property('message', 'failed for some reason');
      });
    });

    describe('# when API config is valid and API response is ok', () => {
      let actions;

      beforeAll(() => {
        timekeeper.freeze(Date.now());
      });

      afterAll(() => {
        timekeeper.reset();
      });

      beforeAll(done => {
        const store = mockStore({});
        const action = {
          [CALL_API]: {
            name: 'USERS',
            endpoint: 'http://localhost:9000/api/users',
          },
        };

        // validation ok
        validateApi.returns(true);
        makeStartAction.returns(() => ({ type: 'START' }))
        makeSuccessAction.returns(json => ({
          type: 'SUCCESS',
          payload: json,
        }));
        mockAdapter.returns(fakeResponse(200, { key: 'value' }));

        store.dispatch(action).then(() => {
          actions = store.getActions();
          done();
        });
      });

      it('should dispatch two actions', () => {
        expect(actions).to.have.length(2);
      });

      it('should dispatch START action first', () => {
        expect(actions[0]).to.have.property('type', 'START');
      });

      it('should dispatch SUCCESS action afterward', () => {
        expect(actions[1]).to.have.property('type', 'SUCCESS');
      });

      it('should dispatch SUCCESS action with json response in payload', () => {
        expect(actions[1].payload).to.have.property('key', 'value');
      });
    });

    describe('# when API config is valid but API response is not ok', () => {
      let actions;

      beforeAll(() => {
        timekeeper.freeze(Date.now());
      });

      afterAll(() => {
        timekeeper.reset();
      });

      beforeAll(done => {
        const store = mockStore({});
        const action = {
          [CALL_API]: {
            name: 'USERS',
            endpoint: 'http://localhost:9000/api/users',
          },
        };

        // validation not ok
        validateApi.returns(true);
        makeStartAction.returns(() => ({ type: 'START' }))
        makeFailureAction.returns(json => ({
          type: 'FAILURE',
          payload: json,
        }));
        mockAdapter.returns(fakeResponse(400, { error: 'value' }));

        store.dispatch(action).then(() => {
          actions = store.getActions();
          done();
        });
      });

      it('should dispatch two actions', () => {
        expect(actions).to.have.length(2);
      });

      it('should dispatch START action first', () => {
        expect(actions[0]).to.have.property('type', 'START');
      });

      it('should dispatch FAILURE action afterward', () => {
        expect(actions[1]).to.have.property('type', 'FAILURE');
      });

      it('should dispatch FAILURE action with json response in payload', () => {
        expect(actions[1].payload).to.have.property('error', 'value');
      });
    });

    describe('# when API config is a function', () => {
      let actions;
      const initialState = { path: 'from-state' };

      beforeAll(done => {
        const store = mockStore(initialState);

        // validation ok
        validateApi.returns(true);
        makeStartAction.returns(() => ({ type: 'START' }))
        makeSuccessAction.returns(json => ({
          type: 'SUCCESS',
          payload: json,
        }));
        mockAdapter.returns(fakeResponse(200, { key: 'value' }));

        const action = {
          [CALL_API]: ({
            endpoint: state => `http://localhost/${state.path}`
          })
        };

        store.dispatch(action).then(() => {
          actions = store.getActions();
          done();
        });
      });

      it('should dispatch 2 actions', () => {
        expect(actions).to.have.length(2);
      });

      it('should dispatch START action first', () => {
        expect(actions[0]).to.have.property('type', 'START')
      });

      it('should get data from state', () => {
        expect(makeStartAction.lastCall.args[0]).to.eql({ endpoint: 'http://localhost/from-state' });
      });

      it('should dispatch SUCCESS action afterward', () => {
        expect(actions[1]).to.have.property('type', 'SUCCESS')
      });
    });

    describe('# when API config is a function that throw', () => {
      let actions;
      const initialState = { shouldThrow: true };

      beforeAll(() => {
        const store = mockStore(initialState);

        // validation ok
        validateApi.returns(true);
        makeStartErrorAction.returns(() => ({ type: 'START_ERROR' }))
        makeSuccessAction.returns(json => ({
          type: 'SUCCESS',
          payload: json,
        }));
        mockAdapter.returns(fakeResponse(200, { key: 'value' }));

        const action = {
          [CALL_API]: {
            endpoint: state => {
              if (state.shouldThrow) {
                throw new Error
              }
            }
          }
        };

        store.dispatch(action);
        actions = store.getActions();
      });

      it('should dispatch 1 action', () => {
        expect(actions).to.have.length(1);
      });

      it('should dispatch START action with error', () => {
        expect(actions[0]).to.have.property('type', 'START_ERROR')
      });
    });
  });
});
