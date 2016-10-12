import timekeeper from 'timekeeper';
import { expect } from 'chai';
import { forEach } from 'lodash';
import { ACTION_FETCH_START, ACTION_FETCH_COMPLETE, ACTION_FETCH_FAILURE } from '../constants';
import { makeStartErrorAction, makeStartAction, makeSuccessAction, makeFailureAction } from '../actions';

describe('Action Creators', () => {
  beforeAll(() => {
    timekeeper.freeze(Date.now());
  });

  afterAll(() => {
    timekeeper.reset();
  });

  describe('makeStartErrorAction', () => {
    let action;
    const SAMPLE_API = {
      name: 'SAMPLE',
      endpoint: 'http://example.com',
    };
    const SAMPLE_ERROR = new Error('some error');

    beforeAll(() => {
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

    beforeAll(() => {
      action = makeStartAction(SAMPLE_API)();
    })

    it('should have type of FETCH_START', () => {
      expect(action).to.have.property('type', ACTION_FETCH_START);
    });

    it('should not have property error', () => {
      expect(action).to.not.have.property('error');
    });

    it('should include api config in payload', () => {
      forEach(SAMPLE_API, (value, key) => {
        expect(action.payload).to.have.property(key, value);
      });
    });

    it('should include requested time as `requestedAt` prop', () => {
      expect(action.payload.requestedAt).to.equal(Date.now());
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

    beforeAll(() => {
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

    beforeAll(() => {
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
