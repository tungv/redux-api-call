import { expect } from 'chai';
import { forEach } from 'lodash';
import { ACTION_FETCH_START, ACTION_FETCH_COMPLETE, ACTION_FETCH_FAILURE } from '../constants';
import { makeStartErrorAction, makeStartAction, makeSuccessAction, makeFailureAction } from '../actions';

describe('Action Creators', () => {
  describe('makeStartErrorAction', () => {
    let action;
    const SAMPLE_API = {
      name: 'SAMPLE',
      endpoint: 'http://example.com',
    };
    const SAMPLE_ERROR = new Error('some error');

    before(() => {
      action = makeStartErrorAction(SAMPLE_API)(SAMPLE_ERROR);
    })

    it('should have type of FETCH_START', () => {
      expect(action).to.have.property('type', ACTION_FETCH_START);
    });

    it('should have property error=true', () => {
      expect(action).to.have.property('error', true);
    });

    it('should include api config in payload', () => {
      forEach(SAMPLE_API, (value, key) => {
        expect(action.payload).to.have.property(key, value);
      });
    });

    it('should include error defailt in payload under `error` property', () => {
      expect(action.payload.error).to.equal(SAMPLE_ERROR);
    });
  });

  describe('makeStartAction', () => {
    let action;
    const SAMPLE_API = {
      name: 'SAMPLE',
      endpoint: 'http://example.com',
    };

    before(() => {
      action = makeStartAction(SAMPLE_API)();
    })

    it('should have type of FETCH_START', () => {
      expect(action).to.have.property('type', ACTION_FETCH_START);
    });

    it('should not have property error', () => {
      expect(action).to.not.have.property('error');
    });

    it('should include api config in payload', () => {
      expect(action.payload).to.equal(SAMPLE_API);
    });
  });

  describe('makeSuccessAction', () => {
    let action;
    const SAMPLE_API = {
      name: 'SAMPLE',
      endpoint: 'http://example.com',
    };
    const SAMPLE_RESPONSE = {
      key: 'value',
    };

    before(() => {
      action = makeSuccessAction(SAMPLE_API)(SAMPLE_RESPONSE);
    })

    it('should have type of FETCH_COMPLETE', () => {
      expect(action).to.have.property('type', ACTION_FETCH_COMPLETE);
    });

    it('should not have property error', () => {
      expect(action).to.not.have.property('error');
    });

    it('should include api config in payload', () => {
      forEach(SAMPLE_API, (value, key) => {
        expect(action.payload).to.have.property(key, value);
      });
    });

    it('should include json response in payload under `json` property', () => {
      expect(action.payload.json).to.equal(SAMPLE_RESPONSE);
    });
  });

  describe('makeFailureAction', () => {
    let action;
    const SAMPLE_API = {
      name: 'SAMPLE',
      endpoint: 'http://example.com',
    };
    const SAMPLE_ERROR = {
      error: 'reason',
    };

    before(() => {
      action = makeFailureAction(SAMPLE_API)(SAMPLE_ERROR);
    })

    it('should have type of FETCH_FAIL', () => {
      expect(action).to.have.property('type', ACTION_FETCH_FAILURE);
    });

    it('should not have property error', () => {
      expect(action).to.not.have.property('error');
    });

    it('should include api config in payload', () => {
      forEach(SAMPLE_API, (value, key) => {
        expect(action.payload).to.have.property(key, value);
      });
    });

    it('should include json response in payload under `json` property', () => {
      expect(action.payload.json).to.equal(SAMPLE_ERROR);
    });
  });

});
