export default next => {
  const lastReqByName = {};

  return async req => {
    const { name } = req;

    lastReqByName[name] = req;

    const resp = await next(req);

    return new Promise((resolve) => {
      if (lastReqByName[name] === req) {
        resolve(resp);
      }
    });
  };
};
