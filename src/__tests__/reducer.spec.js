import timekeeper from 'timekeeper';
import { get } from 'lodash';
import { expect } from 'chai';
import {
  makeStartAction,
  makeStartErrorAction,
  makeSuccessAction,
  makeFailureAction,
} from '../actions';
import reducer from '../reducer';

describe('reducer', () => {
  before(() => {
    timekeeper.freeze(Date.now());
  });

  after(() => {
    timekeeper.reset();
  });

  describe('FETCH_START handler without `error` property', () => {
    let next;
    const state = {
      SAMPLE: {
        data: {
          key: 'old_value'
        },
        error: {
          message: 'some error has occurred'
        }
      }
    };

    before(() => {
      const api = {
        name: 'SAMPLE',
        endpoint: 'http://example.com'
      };
      next = reducer(state, makeStartAction(api)());
    });

    it('should set isFetching to true', () => {
      expect(get(next, 'SAMPLE.isFetching')).to.equal(true);
    });

    it('should set isInvalidated to true', () => {
      expect(get(next, 'SAMPLE.isInvalidated')).to.equal(true);
    });

    it('should set lastRequest to the requestedAt time', () => {
      expect(get(next, 'SAMPLE.lastRequest')).to.equal(Date.now());
    });

    it('should keep previous data as is (referential transparent)', () => {
      expect(get(next, 'SAMPLE.data')).to.equal(state.SAMPLE.data);
    });

    it('should set error to null', () => {
      expect(get(next, 'SAMPLE.error')).to.equal(null);
    });
  });

  describe('FETCH_START handler with `error` property true', () => {
    let next;
    const time = Date.now();
    const state = {
      SAMPLE: {
        data: {
          key: 'old_value'
        },
        error: {
          message: 'some error has occurred'
        }
      }
    };

    before(() => {
      const api = {
        name: 'SAMPLE',
        endpoint: 'http://example.com',
        requestedAt: time,
      };
      const error = { message: 'some new error' }
      next = reducer(state, makeStartErrorAction(api)(error));
    });

    it('should set isFetching to false', () => {
      expect(get(next, 'SAMPLE.isFetching')).to.equal(false);
    });

    it('should set isInvalidated to true', () => {
      expect(get(next, 'SAMPLE.isInvalidated')).to.equal(true);
    });

    it('should set lastRequest to requestedAt time', () => {
      expect(get(next, 'SAMPLE.lastRequest')).to.equal(time);
    });

    it('should keep previous data as is (referential transparent)', () => {
      expect(get(next, 'SAMPLE.data')).to.equal(state.SAMPLE.data);
    });

    it('should set error to new error', () => {
      expect(get(next, 'SAMPLE.error')).to.deep.equal({ message: 'some new error' });
    });
  });

  describe('FETCH_COMPLETE handler', () => {
    let next;
    const state = {
      SAMPLE: {
        data: {
          key: 'old_value'
        },
        error: {
          message: 'some error has occurred'
        }
      }
    };

    before(() => {
      const api = {
        name: 'SAMPLE',
        endpoint: 'http://example.com',
      };
      const json = { key: 'new_value' };
      next = reducer(state, makeSuccessAction(api)(json));
    });

    it('should set isFetching to false', () => {
      expect(get(next, 'SAMPLE.isFetching')).to.equal(false);
    });

    it('should set isInvalidated to false', () => {
      expect(get(next, 'SAMPLE.isInvalidated')).to.equal(false);
    });

    it('should set lastResponse = respondedAt', () => {
      expect(get(next, 'SAMPLE.lastResponse')).to.equal(Date.now());
    });

    it('should set data to new data', () => {
      expect(get(next, 'SAMPLE.data')).to.deep.equal({ key: 'new_value' });
    });

    it('should set error to null', () => {
      expect(get(next, 'SAMPLE.error')).to.equal(null);
    });
  });

  describe('FETCH_FAIL handler', () => {
    let next;
    const state = {
      SAMPLE: {
        data: {
          key: 'old_value'
        },
        lastResponse: 1474877514131,
        error: {
          message: 'some error has occurred'
        }
      }
    };

    before(() => {
      const api = {
        name: 'SAMPLE',
        endpoint: 'http://example.com',
      };
      const json = { error: 'new error' };
      next = reducer(state, makeFailureAction(api)(json));
    });

    it('should set isFetching to false', () => {
      expect(get(next, 'SAMPLE.isFetching')).to.equal(false);
    });

    it('should set isInvalidated to false', () => {
      expect(get(next, 'SAMPLE.isInvalidated')).to.equal(true);
    });

    it('should keep old lastResponse', () => {
      expect(get(next, 'SAMPLE.lastResponse')).to.equal(1474877514131);
    });

    it('should keep old data', () => {
      expect(get(next, 'SAMPLE.data')).to.equal(state.SAMPLE.data);
    });

    it('should set error to null', () => {
      expect(get(next, 'SAMPLE.error')).to.deep.equal({ error: 'new error' });
    });
  });
});
