import { expect } from 'chai';
import configureStore from 'redux-mock-store';
import { stub } from 'sinon';
import timekeeper from 'timekeeper';
import { CALL_API } from '../constants.js';
import { stub_validateApi, reset_validateApi } from '../validateApi.js';
import {
  stub_makeStartAction, reset_makeStartAction,
  stub_makeStartErrorAction, reset_makeStartErrorAction,
  stub_makeSuccessAction, reset_makeSuccessAction,
  stub_makeFailureAction, reset_makeFailureAction,
} from '../actions';

import middleware from '../middleware';
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
    const mock_makeStartAction = stub();
    const mock_makeStartErrorAction = stub();
    const mock_makeSuccessAction = stub();
    const mock_makeFailureAction = stub();
    const mock_validateApi = stub();

    before(() => {
      stub_makeStartAction(mock_makeStartAction);
      stub_makeStartErrorAction(mock_makeStartErrorAction);
      stub_makeSuccessAction(mock_makeSuccessAction);
      stub_makeFailureAction(mock_makeFailureAction);
      stub_validateApi(mock_validateApi);
    });

    after(() => {
      reset_makeStartAction();
      reset_makeStartErrorAction();
      reset_makeSuccessAction();
      reset_makeFailureAction();
      reset_validateApi();
    });

    context('# when CALL_API is not passed', () => {
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

    context('# when API config is invalid', () => {
      let actions;

      before(() => {
        const store = mockStore({});
        mock_validateApi.throws(new Error('failed for some reason'));
        mock_makeStartErrorAction.returns(error => ({ type: 'START_ERROR', payload: error }));

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

    context('# when API config is valid and API response is ok', () => {
      let actions;

      before(() => {
        timekeeper.freeze(Date.now());
      });

      after(() => {
        timekeeper.reset();
      });

      before(done => {
        const store = mockStore({});
        const action = {
          [CALL_API]: {
            name: 'USERS',
            endpoint: 'http://localhost:9000/api/users',
          },
        };

        // validation ok
        mock_validateApi.returns(true);
        mock_makeStartAction.returns(() => ({ type: 'START' }))
        mock_makeSuccessAction.returns(json => ({
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

    context('# when API config is valid but API response is not ok', () => {
      let actions;

      before(() => {
        timekeeper.freeze(Date.now());
      });

      after(() => {
        timekeeper.reset();
      });

      before(done => {
        const store = mockStore({});
        const action = {
          [CALL_API]: {
            name: 'USERS',
            endpoint: 'http://localhost:9000/api/users',
          },
        };

        // validation not ok
        mock_validateApi.returns(true);
        mock_makeStartAction.returns(() => ({ type: 'START' }))
        mock_makeFailureAction.returns(json => ({
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
  });
});
