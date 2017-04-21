const race = (promise, ms) => {
  if (!ms) {
    return promise;
  }

  const timerPromise = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });

  return Promise.race([promise, timerPromise]);
};

export default async ({endpoint, timeout, ...others}) => {
  const resp = await race(fetch(endpoint, others), timeout);
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
