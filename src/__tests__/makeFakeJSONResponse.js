export default (status, json) => Promise.resolve({
  ok: status < 400,
  status,
  json: () => Promise.resolve(json)
});
