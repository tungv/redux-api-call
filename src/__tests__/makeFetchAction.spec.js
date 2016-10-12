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

    it('should return isInvalidatedSelector function', () => {
      expect(actual).to.have.property('isInvalidatedSelector').to.be.an.instanceOf(Function);
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
    });
  });
});
