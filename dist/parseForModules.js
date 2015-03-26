var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var acorn = _interopRequire(require("acorn"));

var umd = _interopRequire(require("acorn-umd"));

var lodash = _interopRequire(require("lodash"));

var acornOptions = {
  ecmaVersion: 6,

  // Be super loose (as who cares for this purpose)
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowHashBang: true
};

module.exports = function (code, options) {
  var varName = lodash.result(options, "varName", "_");
  var ast = acorn.parse(code, lodash.assign({}, acornOptions, lodash.result(options, "acorn")));
  var body = ast.body;

  var imports = lodash(body).map(lodash.cloneDeep).filter({
    type: "ImportDeclaration",
    source: {
      value: "lodash"
    }
  }).pluck("specifiers").flatten().reject(function (specifier) {
    if (specifier["default"]) {
      varName = specifier.id.name;
      return true;
    }
  }).pluck("id").pluck("name").value();

  imports = umd(ast, {
    amd: true,
    cjs: true,
    es6: true
  });

  console.log(imports);
  return imports.concat();
};