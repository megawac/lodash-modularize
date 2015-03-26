var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var fs = _interopRequire(require("./fs"));

var lodashModules = _interopRequire(require("./lodashModules"));

var parseForModules = _interopRequire(require("./parseForModules"));

var isArray = require("lodash").isArray;

var Promise = _interopRequire(require("bluebird"));

var glob = Promise.promisify(require("glob"));

function resolve(modules, files, options) {
  return Promise.map(files, function (file) {
    return fs.readFileAsync(file).then(function (blob) {
      return parseForModules(String(blob), options);
    });
  });
}

function modularize(fileGlob, options) {
  console.log(fileGlob);
  var files = isArray(fileGlob) ? Promise.resolve(fileGlob) : glob(fileGlob);
  return Promise.all([files, lodashModules]).spread(function (files, modules) {
    return resolve(modules, files, options);
  });
}

// Work around Esperanto bs
module.exports = modularize;

module.exports = modularize;