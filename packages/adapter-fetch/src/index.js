export default (next) => async ({endpoint, ...others}) => {
  const resp = await fetch(endpoint, others);
  if (!resp.ok) {
    const error = new Error('Bad Response');
    error.statusCode = resp.statusCode;
    error.payload = await resp.text();
    error.headers = resp.headers;
    throw error;
  }

  return next({
    payload: await resp.text(),
    meta: resp.headers,
  });
};
