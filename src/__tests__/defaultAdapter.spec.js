import defaultAdapter from '../defaultAdapter';
import { expect } from 'chai';

describe.only('defaultAdapter', () => {
  it('should be a function', () => {
    expect(defaultAdapter).to.be.an.instanceOf(Function);
  });

  it('should return a promise', () => {
    expect(defaultAdapter()).to.be.an.instanceOf(Promise);
  });
});
