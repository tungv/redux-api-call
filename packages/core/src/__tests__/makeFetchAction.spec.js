import { constant } from 'lodash';
import timekeeper from 'timekeeper';

import { ACTION_FETCH_START } from '../constants';
import makeFetchAction from '../makeFetchAction';

const NOW = 1478329954380;

describe('makeFetchAction', () => {
  describe('no custom selectors', () => {
    let actual;
    let configFn;

    beforeAll(() => {
      timekeeper.freeze(NOW);
    });

    beforeAll(() => {
      configFn = jest.fn(constant({ endpoint: 'http://example.com' }));
      actual = makeFetchAction('SAMPLE', configFn);
    });

    it('should return actionCreator function', () => {
      expect(actual.actionCreator).toBeInstanceOf(Function);
    });

    it('should return isFetchingSelector function', () => {
      expect(actual.isFetchingSelector).toBeInstanceOf(Function);
    });

    it('should return dataSelector function', () => {
      expect(actual.dataSelector).toBeInstanceOf(Function);
    });

    it('should return errorSelector function', () => {
      expect(actual.errorSelector).toBeInstanceOf(Function);
    });

    it('should return lastResponseSelector function', () => {
      expect(actual.lastResponseSelector).toBeInstanceOf(Function);
    });

    it('should return isInvalidatedSelector function', () => {
      expect(actual.isInvalidatedSelector).toBeInstanceOf(Function);
    });

    describe('actionCreator', () => {
      it('should call configFn with all parameters', () => {
        const params = [1, 2, 3];
        const action = actual.actionCreator(...params);
        expect(configFn).toBeCalledWith(...params);
        expect(action).toEqual({
          type: ACTION_FETCH_START,
          payload: {
            name: 'SAMPLE',
            endpoint: 'http://example.com',
            requestedAt: 1478329954380,
          },
        });
      });
    });

    describe('updater', () => {
      it('should call configFn with all parameters', () => {
        const params = [1, 2, 3];
        const action = actual.updater(...params);
        expect(action).toEqual({
          type: '@@api/UPDATE_LOCAL',
          payload: { name: 'SAMPLE', data: 1 },
        });
      });
    });

    describe('resetter', () => {
      it('should return array of all field if no param', () => {
        const resetter = actual.resetter;
        const actualValue = resetter();
        const expectedValue = {
          type: '@@api/RESET_LOCAL',
          payload: {
            name: 'SAMPLE',
            data: [
              'lastRequest',
              'isFetching',
              'isInvalidated',
              'lastResponse',
              'data',
              'error',
            ],
          },
        };
        expect(actualValue).toEqual(expectedValue);
      });

      it('should return array of 1 string if param is string', () => {
        const resetter = actual.resetter;
        const actualValue = resetter('lastResponse');
        const expectedValue = {
          type: '@@api/RESET_LOCAL',
          payload: {
            name: 'SAMPLE',
            data: ['lastResponse'],
          },
        };
        expect(actualValue).toEqual(expectedValue);
      });

      it('should throw if resetter is called with non-string or non-array value', () => {
        const resetter = actual.resetter;
        expect(() => resetter(1)).toThrow();
      });

      it('should return array of multiple fields if param is array', () => {
        const resetter = actual.resetter;
        const actualValue = resetter(['lastResponse', 'error']);
        const expectedValue = {
          type: '@@api/RESET_LOCAL',
          payload: {
            name: 'SAMPLE',
            data: ['lastResponse', 'error'],
          },
        };
        expect(actualValue).toEqual(expectedValue);
      });
    });

    describe('selectors', () => {
      describe('isFetchingSelector', () => {
        it('should return isFetching in state if present', () => {
          expect(
            actual.isFetchingSelector({
              api_calls: {
                SAMPLE: {
                  isFetching: true,
                },
              },
            })
          ).toBe(true);

          expect(
            actual.isFetchingSelector({
              api_calls: {
                SAMPLE: {
                  isFetching: false,
                },
              },
            })
          ).toBe(false);
        });

        it('should return false if api was not called', () => {
          expect(actual.isFetchingSelector({})).toBe(false);
        });
      });

      describe('isInvalidatedSelector', () => {
        it('should return isInvalidated in state if present', () => {
          expect(
            actual.isInvalidatedSelector({
              api_calls: {
                SAMPLE: {
                  isInvalidated: true,
                },
              },
            })
          ).toBe(true);

          expect(
            actual.isInvalidatedSelector({
              api_calls: {
                SAMPLE: {
                  isInvalidated: false,
                },
              },
            })
          ).toBe(false);
        });

        it('should return false if api was not called', () => {
          expect(actual.isInvalidatedSelector({})).toBe(false);
        });
      });

      describe('dataSelector', () => {
        it('should return data in state if present', () => {
          const data = { key: 'value' };
          expect(
            actual.dataSelector({
              api_calls: {
                SAMPLE: {
                  data,
                },
              },
            })
          ).toBe(data);
        });

        it('should return null if api was not called', () => {
          expect(actual.dataSelector({})).toBe(null);
        });
      });

      describe('errorSelector', () => {
        it('should return error in state if present', () => {
          const error = { error: 'value' };
          expect(
            actual.errorSelector({
              api_calls: {
                SAMPLE: {
                  error,
                },
              },
            })
          ).toBe(error);
        });

        it('should return null if api was not called', () => {
          expect(actual.errorSelector({})).toBe(null);
        });
      });

      describe('lastResponseSelector', () => {
        it('should return lastResponse in state if present', () => {
          const lastResponse = 12345;
          expect(
            actual.lastResponseSelector({
              api_calls: {
                SAMPLE: {
                  lastResponse: 12345,
                },
              },
            })
          ).toBe(lastResponse);
        });

        it('should return null if api was not called', () => {
          expect(actual.lastResponseSelector({})).toBe(null);
        });
      });
    });
  });
});
