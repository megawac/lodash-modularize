var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Promise = _interopRequire(require("bluebird"));

var path = _interopRequire(require("path"));

var zipObject = require("lodash").zipObject;

var fs = _interopRequire(require("fs"));

function getDirectories(srcpath) {
  return fs.readdirAsync(srcpath).filter(function (file) {
    return fs.statAsync(path.join(srcpath, file)).then(function (stat) {
      return stat.isDirectory();
    });
  });
}

var lodashPath = "./node_modules/lodash";
var m = undefined;

module.exports = getDirectories(lodashPath).then(function (modules) {
  m = modules;
  return Promise.map(modules, function (val) {
    return fs.readdirAsync(path.join(lodashPath, val)).map(function (name) {
      return name.slice(0, -3);
    });
  });
}).then(function (functions) {
  return zipObject(m, functions);
})["catch"](console.error);