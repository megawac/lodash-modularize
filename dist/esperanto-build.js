var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = build;

var esperanto = _interopRequire(require("esperanto"));

var fs = _interopRequire(require("fs"));

var path = _interopRequire(require("path"));

var _lodash = require("lodash");

var includes = _lodash.includes;
var template = _lodash.template;

var tplPath = path.join(__dirname, "../templates/import-build.tpl");
var buildTemplate = template(fs.readFileSync(tplPath));

function build(methods, modules, options) {
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

  var code = buildTemplate({ config: config });
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