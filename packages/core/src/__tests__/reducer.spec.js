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
  beforeAll(() => {
    timekeeper.freeze(Date.now());
  });

  afterAll(() => {
    timekeeper.reset();
  });

  describe('FETCH_START handler without `error` property', () => {
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

    const setup = () => {
      const api = {
        name: 'SAMPLE',
        endpoint: 'http://example.com'
      };
      return reducer(state, makeStartAction(api));
    };

    it('should set isFetching to true', () => {
      expect(get(setup(), 'SAMPLE.isFetching')).to.equal(true);
    });

    it('should set isInvalidated to true', () => {
      expect(get(setup(), 'SAMPLE.isInvalidated')).to.equal(true);
    });

    it('should set lastRequest to the requestedAt time', () => {
      expect(get(setup(), 'SAMPLE.lastRequest')).to.equal(Date.now());
    });

    it('should keep previous data as is (referential transparent)', () => {
      expect(get(setup(), 'SAMPLE.data')).to.equal(state.SAMPLE.data);
    });

    it('should keep previous data as is (referential transparent)', () => {
      expect(get(setup(), 'SAMPLE.error')).to.equal(state.SAMPLE.error);
    });
  });

  describe('FETCH_START handler with `error` property true', () => {
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

    const setup = () => {
      const api = {
        name: 'SAMPLE',
        endpoint: 'http://example.com',
        requestedAt: time,
      };
      const error = { message: 'some new error' }
      return reducer(state, makeStartErrorAction({ ...api, error }));
    };

    it('should set isFetching to false', () => {
      expect(get(setup(), 'SAMPLE.isFetching')).to.equal(false);
    });

    it('should set isInvalidated to true', () => {
      expect(get(setup(), 'SAMPLE.isInvalidated')).to.equal(true);
    });

    it('should set lastRequest to requestedAt time', () => {
      expect(get(setup(), 'SAMPLE.lastRequest')).to.equal(time);
    });

    it('should keep previous data as is (referential transparent)', () => {
      expect(get(setup(), 'SAMPLE.data')).to.equal(state.SAMPLE.data);
    });

    it('should set error to new error', () => {
      expect(get(setup(), 'SAMPLE.error')).to.deep.equal({ message: 'some new error' });
    });
  });

  describe('FETCH_COMPLETE handler', () => {
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

    const setup = () => {
      const api = {
        name: 'SAMPLE',
        endpoint: 'http://example.com',
      };
      const resp = {
        payload: { key: 'new_value' },
        meta: { header: 'value' },
      }
      return reducer(state, makeSuccessAction(api, resp));
    };

    it('should set isFetching to false', () => {
      expect(get(setup(), 'SAMPLE.isFetching')).to.equal(false);
    });

    it('should set isInvalidated to false', () => {
      expect(get(setup(), 'SAMPLE.isInvalidated')).to.equal(false);
    });

    it('should set lastResponse = respondedAt', () => {
      expect(get(setup(), 'SAMPLE.lastResponse')).to.equal(Date.now());
    });

    it('should set data to new data', () => {
      expect(get(setup(), 'SAMPLE.data')).to.deep.equal({ key: 'new_value' });
    });

    it('should set error to null', () => {
      expect(get(setup(), 'SAMPLE.error')).to.equal(null);
    });

    it('should set headers to new value', () => {
      expect(get(setup(), 'SAMPLE.headers')).to.deep.equal({ header: 'value' });
    });
  });

  describe('FETCH_FAIL handler', () => {
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

    const setup = () => {
      const api = {
        name: 'SAMPLE',
        endpoint: 'http://example.com',
      };
      const resp = {
        payload: { error: 'new error' },
        meta: { header: 'new header' },
      };
      return reducer(state, makeFailureAction(api, resp));
    };

    it('should set isFetching to false', () => {
      expect(get(setup(), 'SAMPLE.isFetching')).to.equal(false);
    });

    it('should set isInvalidated to false', () => {
      expect(get(setup(), 'SAMPLE.isInvalidated')).to.equal(true);
    });

    it('should keep old lastResponse', () => {
      expect(get(setup(), 'SAMPLE.lastResponse')).to.equal(1474877514131);
    });

    it('should keep old data', () => {
      expect(get(setup(), 'SAMPLE.data')).to.equal(state.SAMPLE.data);
    });

    it('should set error to null', () => {
      expect(get(setup(), 'SAMPLE.error')).to.deep.equal({ error: 'new error' });
    });

    it('should set error to null', () => {
      expect(get(setup(), 'SAMPLE.headers')).to.deep.equal({ header: 'new header' });
    });
  });

  describe('UPDATE_LOCAL handler', () => {
    const state = {
      SAMPLE: {
        data: {
          key: 'old_value'
        },
      }
    };

    const setup = () => {
      const api = {
        name: 'SAMPLE',
        endpoint: 'http://example.com',
      };
      const json = { error: 'new error' };
      return reducer(state, { type: '@@api/UPDATE_LOCAL', payload: { name: 'SAMPLE', data: { key: 'new_value' } } });
    };

    it('should update local', () => {
      expect(get(setup(), 'SAMPLE.data.key')).to.equal('new_value');
    });
  });

  describe('ACTION_RESET_LOCAL handler', () => {
    const state = {
      SAMPLE: {
        lastResponse: 'lastResponse',
        lastRequest: 'lastRequest',
        isInvalidated: 'isInvalidated',
        isFetching: 'isFetching',
        error: 'error',
        data: {
          key: 'old_value'
        },
      }
    };

    const setup = (data) => {
      const api = {
        name: 'SAMPLE',
        endpoint: 'http://example.com',
      };
      const json = { error: 'new error' };
      return reducer(state, { type: '@@api/RESET_LOCAL', payload: { name: 'SAMPLE', data: data } });
    };

    it('should update local with array of fields', () => {
      const actual = setup(['lastResponse']);
      const expected = {
        SAMPLE: {
          ...state.SAMPLE,
          lastResponse: undefined,
        }
      };

      expect(actual).to.deep.equal(expected);
    });

    it('should update local with array of 2 fields', () => {
      const actual = setup(['lastResponse', 'error']);
      const expected = {
        SAMPLE: {
          ...state.SAMPLE,
          lastResponse: undefined,
          error: undefined,
        }
      };
      expect(actual).to.deep.equal(expected);
    });

    it('should update local with array of 2 fields and 1 invalid field', () => {
      const actual = setup(['lastResponse', 'error', 'invalid']);
      const expected = {
        SAMPLE: {
          ...state.SAMPLE,
          lastResponse: undefined,
          error: undefined,
        }
      };
      expect(actual).to.deep.equal(expected);
    });

    it('should update local with array of all fields', () => {
      const actual = setup(
        [
          'lastRequest',
          'isFetching',
          'isInvalidated',
          'lastResponse',
          'data',
          'error',
        ]
      );
      const expected = {
        SAMPLE: {
          lastRequest: undefined,
          isFetching: undefined,
          isInvalidated: undefined,
          lastResponse: undefined,
          data: undefined,
          error: undefined,
        },
      };
      expect(actual).to.deep.equal(expected);
    });

  });
});
