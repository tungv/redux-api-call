export default ({ endpoint, ...others }) => {
  return fetch(endpoint, others);
};
