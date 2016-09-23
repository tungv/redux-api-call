import { expect } from 'chai';
import configureStore from 'redux-mock-store';
import { stub } from 'sinon';
import timekeeper from 'timekeeper';
import fakeResponse from './makeFakeJSONResponse';
import {
  CALL_API,
  ACTION_FETCH_START,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE,
} from '../constants.js';
import middleware from '../middleware';

describe('middleware', () => {
  it('should be a function', () => {
    expect(middleware).to.be.a.function;
  });

  describe('with store', () => {
    const mockAdapter = stub();
    const mockStore = configureStore([middleware(mockAdapter)]);

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
      const store = mockStore({});
      store.dispatch({
        [CALL_API]: {}
      });
      const actions = store.getActions();

      it('should dispatch one action', () => {
        expect(actions).to.have.length(1);
      });

      it('should have type of FETCH_START', () => {
        expect(actions[0]).to.have.property('type', ACTION_FETCH_START);
      });

      it('should have error = true', () => {
        expect(actions[0]).to.have.property('error', true);
      });

      it('should have payload.error with `invalid` message', () => {
        expect(actions[0])
          .to.have.property('payload')
          .to.have.property('error')
          .to.match(/invalid/);
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

        mockAdapter.returns(fakeResponse(200, { key: 'value' }));

        store.dispatch(action).then(() => {
          actions = store.getActions();
          done();
        });
      });

      it('should dispatch two actions', () => {
        expect(actions).to.have.length(2);
      });

      describe('FETCH_START action', () => {
        it('should have type of FETCH_START', () => {
          expect(actions[0]).to.have.property('type', ACTION_FETCH_START);
        });

        it('should not have property error', () => {
          expect(actions[0]).to.not.have.property('error');
        });

        it('should have payload that includes the original API config', () => {
          expect(actions[0]).to.have.property('payload');
          const { payload } = actions[0];
          expect(payload).to.have.property('name', 'USERS');
          expect(payload).to.have.property('endpoint', 'http://localhost:9000/api/users');
        });
      });

      describe('FETCH_COMPLETE action', () => {
        it('should have type of FETCH_COMPLETE', () => {
          expect(actions[1]).to.have.property('type', ACTION_FETCH_COMPLETE);
        });

        it('should not have property error', () => {
          expect(actions[1]).to.not.have.property('error');
        });

        it('should include the original API config in payload', () => {
          expect(actions[1]).to.have.property('payload');
          const { payload } = actions[1];
          expect(payload).to.have.property('name', 'USERS');
          expect(payload).to.have.property('endpoint', 'http://localhost:9000/api/users');
        });

        it('should include the json response in payload', () => {
          const { payload: { json } } = actions[1];
          expect(json).to.eql({ key: 'value' });
        });

        it('should include the timestamp response in payload', () => {
          const { payload: { timestamp } } = actions[1];
          expect(timestamp).to.equal(Date.now());
        });
      });
    });

    context('# when API config is valid and API response is not ok', () => {
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

        mockAdapter.returns(fakeResponse(400, { error: 'value' }));

        store.dispatch(action).then(() => {
          actions = store.getActions();
          done();
        });
      });

      it('should dispatch two actions', () => {
        expect(actions).to.have.length(2);
      });

      describe('FETCH_START action', () => {
        it('should have type of FETCH_START', () => {
          expect(actions[0]).to.have.property('type', ACTION_FETCH_START);
        });

        it('should not have property error', () => {
          expect(actions[0]).to.not.have.property('error');
        });

        it('should have payload that includes the original API config', () => {
          expect(actions[0]).to.have.property('payload');
          const { payload } = actions[0];
          expect(payload).to.have.property('name', 'USERS');
          expect(payload).to.have.property('endpoint', 'http://localhost:9000/api/users');
        });
      });

      describe('FETCH_FAILURE action', () => {
        it('should have type of FETCH_FAILURE', () => {
          expect(actions[1]).to.have.property('type', ACTION_FETCH_FAILURE);
        });

        it('should not have property error', () => {
          expect(actions[1]).to.not.have.property('error');
        });

        it('should include the original API config in payload', () => {
          expect(actions[1]).to.have.property('payload');
          const { payload } = actions[1];
          expect(payload).to.have.property('name', 'USERS');
          expect(payload).to.have.property('endpoint', 'http://localhost:9000/api/users');
        });

        it('should include the json response in payload', () => {
          const { payload: { json } } = actions[1];
          expect(json).to.eql({ error: 'value' });
        });

        it('should include the timestamp response in payload', () => {
          const { payload: { timestamp } } = actions[1];
          expect(timestamp).to.equal(Date.now());
        });
      });
    });
  });
});
