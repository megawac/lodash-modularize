import _ from 'lodash';

export default _.mapValues(_.prototype, (method, name) => {
  try {
    return _()[name]() instanceof _;
  } catch (e) {
    return false;
  }
});
