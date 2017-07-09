import { stub } from 'sinon';
import { expect } from 'chai';
import { constant } from 'lodash';
import makeFetchAction from '../makeFetchAction';

describe('makeFetchAction', () => {
  describe('no custom selectors', () => {
    let actual;
    beforeAll(() => {
      actual = makeFetchAction(
        'SAMPLE',
        constant({ endpoint: 'http://example.com' })
      );
    });

    it('should return actionCreator function', () => {
      expect(actual).to.have.property('actionCreator').to.be.an.instanceOf(Function);
    });

    it('should return isFetchingSelector function', () => {
      expect(actual).to.have.property('isFetchingSelector').to.be.an.instanceOf(Function);
    });

    it('should return dataSelector function', () => {
      expect(actual).to.have.property('dataSelector').to.be.an.instanceOf(Function);
    });

    it('should return errorSelector function', () => {
      expect(actual).to.have.property('errorSelector').to.be.an.instanceOf(Function);
    });

    it('should return lastResponseSelector function', () => {
      expect(actual).to.have.property('lastResponseSelector').to.be.an.instanceOf(Function);
    });

    it('should return isInvalidatedSelector function', () => {
      expect(actual).to.have.property('isInvalidatedSelector').to.be.an.instanceOf(Function);
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
        }
        expect(actualValue).to.deep.equal(expectedValue);
      });

      it('should return array of 1 string if param is string', () => {
        const resetter = actual.resetter;
        const actualValue = resetter('lastResponse');
        const expectedValue = {
          type: '@@api/RESET_LOCAL',
          payload: {
            name: 'SAMPLE',
            data: [
              'lastResponse',
            ],
          },
        }
        expect(actualValue).to.deep.equal(expectedValue);
      });

      it('should throw if resetter is called with non-string or non-array value', () => {
        const resetter = actual.resetter;
        expect(
          () => resetter(1)
        ).to.throw();
      });

      it('should return array of multiple fields if param is array', () => {
        const resetter = actual.resetter;
        const actualValue = resetter(['lastResponse', 'error']);
        const expectedValue = {
          type: '@@api/RESET_LOCAL',
          payload: {
            name: 'SAMPLE',
            data: [
              'lastResponse',
              'error',
            ],
          },
        }
        expect(actualValue).to.deep.equal(expectedValue);
      });

    });

    describe('selectors', () => {
      describe('isFetchingSelector', () => {
        it('should return isFetching in state if present', () => {
          expect(actual.isFetchingSelector({
            api_calls: {
              SAMPLE: {
                isFetching: true
              }
            }
          })).to.equal(true);

          expect(actual.isFetchingSelector({
            api_calls: {
              SAMPLE: {
                isFetching: false
              }
            }
          })).to.equal(false);
        });

        it('should return false if api was not called', () => {
          expect(actual.isFetchingSelector({})).to.equal(false);
        });
      });

      describe('isInvalidatedSelector', () => {
        it('should return isInvalidated in state if present', () => {
          expect(actual.isInvalidatedSelector({
            api_calls: {
              SAMPLE: {
                isInvalidated: true
              }
            }
          })).to.equal(true);

          expect(actual.isInvalidatedSelector({
            api_calls: {
              SAMPLE: {
                isInvalidated: false
              }
            }
          })).to.equal(false);
        });

        it('should return false if api was not called', () => {
          expect(actual.isInvalidatedSelector({})).to.equal(false);
        });
      });

      describe('dataSelector', () => {
        it('should return data in state if present', () => {
          const data = { key: 'value' };
          expect(actual.dataSelector({
            api_calls: {
              SAMPLE: {
                data
              }
            }
          })).to.equal(data);
        });

        it('should return null if api was not called', () => {
          expect(actual.dataSelector({})).to.equal(null);
        });
      });

      describe('errorSelector', () => {
        it('should return error in state if present', () => {
          const error = { error: 'value' };
          expect(actual.errorSelector({
            api_calls: {
              SAMPLE: {
                error
              }
            }
          })).to.equal(error);
        });

        it('should return null if api was not called', () => {
          expect(actual.errorSelector({})).to.equal(null);
        });
      });

      describe('lastResponseSelector', () => {
        it('should return lastResponse in state if present', () => {
          const lastResponse = 12345;
          expect(actual.lastResponseSelector({
            api_calls: {
              SAMPLE: {
                lastResponse: 12345
              }
            }
          })).to.equal(lastResponse);
        });

        it('should return null if api was not called', () => {
          expect(actual.lastResponseSelector({})).to.equal(null);
        });
      });

    });
  });
});
