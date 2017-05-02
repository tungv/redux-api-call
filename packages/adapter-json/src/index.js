const tryJSON = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (ex) {
    return raw;
  }
};

export default (next) => async (req) => {
  try {
    const { payload, ...others } = await next(req);
    return {
      payload: tryJSON(payload),
      ...others
    }

  } catch ({ payload, ...others }) {
    throw {
      payload: tryJSON(payload),
      ...others
    }
  }
}
