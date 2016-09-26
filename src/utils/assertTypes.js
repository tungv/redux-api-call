export default (value, types, msg) => {
  if (!types.test(typeof value)) throw new Error(msg)
}
