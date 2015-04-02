var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.resolve = resolve;
exports.build = build;
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

var esperanto = _interopRequire(require("esperanto"));

var tplPath = path.join(__dirname, "../templates/import-build.tpl");
var buildTemplate = template(fs.readFileSync(tplPath));

function resolve(files, options) {
  return Promise.map(files, function (file) {
    return fs.readFileAsync(file).then(function (blob) {
      return parseForModules(String(blob), options);
    });
  }).then(function (modules) {
    return uniq(flatten(modules));
  });
}

function build(code, options) {
  var opts = {
    _evilES3SafeReExports: true,
    strict: false,
    name: "lodash",
    amdName: "lodash"
  };
  switch (options.outFormat) {
    case "cjs":
      return esperanto.toCjs(code, opts);
    case "amd":
      return esperanto.toAmd(code, opts);
    case "umd":
      return esperanto.toUmd(code, opts);
    case "es6":
      return { code: code };
  }
  throw "Unsupported format: " + options.outFormat;
}

function modularize(fileGlob, options) {
  var files = (isArray(fileGlob) ? Promise.resolve(fileGlob) : glob(fileGlob)).then(function (files) {
    return resolve(files, options);
  });

  return Promise.all([files, lodashModules]).spread(function (methods, modules) {
    // What to do with the resulting methods (e.g. export, list, etc)
    if (options.list) {
      return methods;
    } else if (options.compile) {} else {
      var _build;

      var _ret = (function () {
        // Otherwise compile a file for them to the modularization
        var config = methods.map(function (name) {
          for (var category in modules) {
            if (includes(modules[category], name)) {
              break;
            }
          }
          return {
            name: name,
            path: path.join(options.lodashPath, category, name)
          };
        });

        _build = build(buildTemplate({ config: config }), options);
        var code = _build.code;

        if (options.outfile) {
          return {
            v: fs.writeFile(options.outfile, code).then(function () {
              return code;
            })
          };
        }
        return {
          v: code
        };
      })();

      if (typeof _ret === "object") return _ret.v;
    }
  });
}

// Work around Esperanto bs
exports["default"] = modularize;

module.exports = modularize;