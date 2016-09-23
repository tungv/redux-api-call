import middleware from '../middleware';
import { expect } from 'chai';

describe('middleware', () => {
  it('should be a function', () => {
    expect(middleware).to.be.a.function;
  });
});
