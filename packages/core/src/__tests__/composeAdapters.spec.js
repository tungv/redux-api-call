import composeAdapters from '../composeAdapters'

describe('composeAdatpers()', () => {
  it('should throw error if no adapter is passed', () => {
    expect(() => {
      composeAdapters()
    }).toThrow(/least one adapter/)
  });

  it('should work with one adapter', () => {
    const expectedFetcher = jest.fn();
    const adapter = jest.fn(next => expectedFetcher);

    const composed = composeAdapters(adapter);

    const getState = jest.fn();
    const fetcher = composed(getState);

    expect(fetcher).toBe(expectedFetcher);
  });

  it('should throw if called without adapters', () => {
    expect(
      () => composeAdapters()
    ).toThrow()
  });

  it('should work with multiple adapters', async () => {
    const expectedFetcher = jest.fn(() => ({
      data: 42,
      headers: {}
    }));

    const adapter1 = jest.fn(next => async (req) => {
      const transformed = { ...req, key: 'value' };
      const resp = await next(transformed);
      return {
        data: resp.data + 1,
        headers: { 'x-header': 42 }
      }
    });

    const adapter2 = jest.fn(next => expectedFetcher);

    const composed = composeAdapters(adapter1, adapter2);

    const getState = jest.fn();
    const fetcher = composed(getState);
    const originalRequest = { iamauthentic: true };

    const result = await fetcher(originalRequest);

    expect(expectedFetcher).toBeCalledWith({ iamauthentic: true, key: 'value' })
    expect(result).toEqual({
      data: 43,
      headers: { 'x-header': 42 }
    })
  });

  it('should work when next is called in last adapter', async () => {
    const adapter = jest.fn(next => (req) => next(req));

    const composed = composeAdapters(adapter);

    const getState = jest.fn();
    const fetcher = composed(getState);
    const resp = await fetcher({ a: 1 });
    expect(resp).toEqual({ a: 1 });
  });
});
