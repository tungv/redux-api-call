const tryJSON = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (ex) {
    return raw;
  }
};

export default (next) => async (req) => {
  try {
    const { data, ...others } = await next(req);
    return {
      data: tryJSON(data),
      ...others
    }

  } catch ({ data, ...others }) {
    throw {
      data: tryJSON(data),
      ...others
    }
  }
}
