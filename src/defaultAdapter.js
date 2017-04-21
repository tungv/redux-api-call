export default async ({endpoint, ...others}) => {
  const resp = await fetch(endpoint, others);
  if (!resp.ok) {
    const error = new Error('Bad Response');
    error.statusCode = resp.statusCode;

    if (resp.json) {
      error.data = await resp.json();
    } else {
      error.data = await resp.text();
    }

    error.headers = resp.headers;
    throw error;
  }
  return {
    data: await resp.json(),
    headers: resp.headers,
  };
};
