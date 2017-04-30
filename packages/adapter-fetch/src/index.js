export default (next) => async ({endpoint, ...others}) => {
  const resp = await fetch(endpoint, others);
  if (!resp.ok) {
    const error = new Error('Bad Response');
    error.statusCode = resp.statusCode;
    error.data = await resp.text();
    error.headers = resp.headers;
    throw error;
  }

  return next({
    data: await resp.text(),
    headers: resp.headers,
  });
};
