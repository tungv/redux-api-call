import { expect } from 'chai';
import get from '../get';

describe('utils > get', () => {
  it('should return default value if actual value is undefined', () => {
    expect(get(['a', 'b', 'c'], 1)({})).to.equal(1);
  });

  it('should return value in nested object', () => {
    expect(get(['a', 'b', 'c'], 1)({ a: { b: { c: 'xxx' }}})).to.equal('xxx');
  });
});
