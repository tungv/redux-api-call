const jsonOrText = async (resp) => {
  const raw = await resp.text();
  try {
    return JSON.parse(raw);
  } catch (ex) {
    return raw;
  }
};

export default async ({endpoint, ...others}) => {
  const resp = await fetch(endpoint, others);
  if (!resp.ok) {
    const error = new Error('Bad Response');
    error.statusCode = resp.statusCode;

    error.data = await jsonOrText(resp);

    error.headers = resp.headers;
    throw error;
  }

  return {
    data: await jsonOrText(resp),
    headers: resp.headers,
  };
};
