import { expect } from 'chai';
import { constant } from 'lodash';
import makeFetchAction from '../makeFetchAction';

describe('makeFetchAction', () => {
  it('should throw error if a selector is not a function', () => {
    expect(() => {
      makeFetchAction(
        'MUST_FAIL',
        () => ({ endpoint: 'some path' }),
        {
          fail: 'must failed!!!'
        }
      );
    }).to.throw('selector for "fail" must be a function')
  });

  describe('no custom selectors', () => {
    let actual;
    before(() => {
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

    it('should return invalidatedSelector function', () => {
      expect(actual).to.have.property('invalidatedSelector').to.be.an.instanceOf(Function);
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

      describe('invalidatedSelector', () => {
        it('should return invalidated in state if present', () => {
          expect(actual.invalidatedSelector({
            api_calls: {
              SAMPLE: {
                invalidated: true
              }
            }
          })).to.equal(true);

          expect(actual.invalidatedSelector({
            api_calls: {
              SAMPLE: {
                invalidated: false
              }
            }
          })).to.equal(false);
        });

        it('should return false if api was not called', () => {
          expect(actual.invalidatedSelector({})).to.equal(false);
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

  describe('custom selectors', () => {
    let actual;
    before(() => {
      actual = makeFetchAction(
        'SAMPLE',
        constant({ endpoint: 'http://example.com' }),
        {
          data1: data => data.key1,
          data2: data => data.key2,
        }
      );
    });

    it('should return data1Selector and data2Selector functions', () => {
      expect(actual).to.have.property('data1Selector').to.be.an.instanceOf(Function);
      expect(actual).to.have.property('data2Selector').to.be.an.instanceOf(Function);
    });

    describe('custom selector functions', () => {
      it('should return value based on dataSelector', () => {
        expect(actual.data1Selector({
          api_calls: {
            SAMPLE: {
              data: {
                key1: 'key1',
                key2: 'key2',
              },
            },
          },
        })).to.equal('key1');

        expect(actual.data2Selector({
          api_calls: {
            SAMPLE: {
              data: {
                key1: 'key1',
                key2: 'key2',
              },
            },
          },
        })).to.equal('key2');
      });
    });
  });
});
