var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Promise = _interopRequire(require("bluebird"));

module.exports = Promise.promisifyAll(require("fs"));