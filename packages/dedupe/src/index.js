export default (next) => {
  // using WeakMap to avoid mutating the original requests
  // CancelledRequestsType = { [req: RequestType]: boolean }
  const cancelled = new WeakMap();

  // LastPendingType = { [apiName: string]: RequestType }
  const lastPendings = {};

  return async (req) => {
    cancelled.set(req, false);
    const lastPending = lastPendings[req.name];

    if (lastPending) {
      cancelled.set(lastPending, true);
    }

    // before sending request, set this as the last pending of its group
    lastPendings[req.name] = req;

    // pass request to the next middleware
    const resp = await next(req);

    // after receiving response, if this is cancelled, return empty data;
    const isReqCancelled = cancelled.get(req);
    if (isReqCancelled) {
      return null
    }

    return resp;
  }
}
