export default next => {
  const lastReqByName = {};

  return req => {
    const { name } = req;

    lastReqByName[name] = req;

    return new Promise((resolve, reject) => {
      next(req).then(resp => {
        // is it still valid?
        if (lastReqByName[name] === req) {
          resolve(resp);
        }
      }, reject);
    });
  };
};
