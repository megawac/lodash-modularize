var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.resolve = resolve;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var path = _interopRequire(require("path"));

var fs = _interopRequire(require("./fs"));

var lodashModules = _interopRequire(require("./lodashModules"));

var parseForModules = _interopRequire(require("./parseForModules"));

var _lodash = require("lodash");

var flatten = _lodash.flatten;
var includes = _lodash.includes;
var isArray = _lodash.isArray;
var uniq = _lodash.uniq;
var template = _lodash.template;

var Promise = _interopRequire(require("bluebird"));

var glob = Promise.promisify(require("glob"));

var templatePromise = fs.readFileAsync(path.join(__dirname, "../templates/import-build.tpl")).then(function (templateStr) {
  return template(templateStr);
});

function resolve(files, options) {
  return Promise.map(files, function (file) {
    return fs.readFileAsync(file).then(function (blob) {
      return parseForModules(String(blob), options);
    });
  }).then(function (modules) {
    return uniq(flatten(modules));
  });
}

function modularize(fileGlob, options) {
  var files = (isArray(fileGlob) ? Promise.resolve(fileGlob) : glob(fileGlob)).then(function (files) {
    return resolve(files, options);
  });

  return Promise.all([files, lodashModules, templatePromise]).spread(function (methods, modules, template) {
    // What to do with the resulting methods (e.g. export, list, etc)
    if (options.list) {
      return methods;
    } else if (options.compile) {} else {
      // Otherwise compile a file for them to the modularization
      var config = methods.map(function (name) {
        for (var category in modules) {
          if (includes(modules[category], name)) {
            break;
          }
        }
        return {
          name: name,
          path: path.join(options.lodash, category, name)
        };
      });
      console.log(template({ config: config }));
    }
  });
}

// Work around Esperanto bs
exports["default"] = modularize;

module.exports = modularize;