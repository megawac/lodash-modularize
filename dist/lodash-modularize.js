var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.resolve = resolve;
exports["default"] = modularize;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var fs = _interopRequire(require("./fs"));

var lodashModules = _interopRequire(require("./lodashModules"));

var parseForModules = _interopRequire(require("./parseForModules"));

var _lodash = require("lodash");

var flatten = _lodash.flatten;
var includes = _lodash.includes;
var isArray = _lodash.isArray;
var uniq = _lodash.uniq;

var Promise = _interopRequire(require("bluebird"));

var glob = Promise.promisify(require("glob"));

var esperantoBuild = _interopRequire(require("./esperanto-build"));

var cliBuild = _interopRequire(require("./cli-build"));

require("colors");

function resolve(files, options) {
  return Promise.map(files, function (file) {
    return fs.readFileAsync(file).then(function (blob) {
      return parseForModules(blob, options);
    }).then(function (methods) {
      if (includes(methods, "chain")) {
        throw "Chaining syntax in " + file.underline + " is not yet supported";
      }
      return methods;
    });
  }).then(function (methods) {
    return uniq(flatten(methods));
  });
}

function modularize(fileGlob, options) {
  var files = (isArray(fileGlob) ? Promise.resolve(fileGlob) : glob(fileGlob)).then(function (files) {
    return resolve(files, options);
  });

  return Promise.all([files, lodashModules]).spread(function (methods, modules) {
    // What to do with the resulting methods (e.g. export, list, etc)
    if (options.list) {
      return methods;
    }
    var code = undefined;
    if (options.compile) {
      code = cliBuild(methods, options);
    } else {
      code = esperantoBuild(methods, modules, options).code;
    }

    if (options.outfile) {
      return fs.writeFileAsync(options.outfile, code).then(function () {
        return code;
      });
    }
    return code;
  });
}

module.exports = modularize;