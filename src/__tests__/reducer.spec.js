import { get } from 'lodash';
import { expect } from 'chai';
import {
  makeStartAction,
  makeStartErrorAction,
} from '../actions';
import reducer from '../reducer';

describe('reducer', () => {
  describe('FETCH_START handler without `error` property', () => {
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
      next = reducer(state, makeStartAction(api)());
    });

    it('should set isFetching to true', () => {
      expect(get(next, 'SAMPLE.isFetching')).to.equal(true);
    });

    it('should set invalidated to true', () => {
      expect(get(next, 'SAMPLE.invalidated')).to.equal(true);
    });

    it('should set lastRequest the requestedAt time', () => {
      expect(get(next, 'SAMPLE.lastRequest')).to.equal(time);
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

    it('should set invalidated to true', () => {
      expect(get(next, 'SAMPLE.invalidated')).to.equal(true);
    });

    it('should set lastRequest the requestedAt time', () => {
      expect(get(next, 'SAMPLE.lastRequest')).to.equal(time);
    });

    it('should keep previous data as is (referential transparent)', () => {
      expect(get(next, 'SAMPLE.data')).to.equal(state.SAMPLE.data);
    });

    it('should set error to new error', () => {
      expect(get(next, 'SAMPLE.error')).to.deep.equal({ message: 'some new error' });
    });
  });
});
