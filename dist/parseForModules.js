var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

exports.findModules = findModules;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var parse = require("acorn").parse;

var umd = _interopRequire(require("acorn-umd"));

var estraverse = _interopRequire(require("estraverse"));

var _lodash = require("lodash");

var lodash = _interopRequire(_lodash);

var includes = _lodash.includes;
var reject = _lodash.reject;

var acornOptions = {
  ecmaVersion: 6,

  sourceType: "module",

  // Be super loose (as who cares for this purpose)
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowHashBang: true
};

function findModules(_ref) {
  var imports = _ref.imports;
  var scope = _ref.scope;

  var result = [];
  estraverse.traverse(scope.block, {
    enter: function enter(node) {
      switch (node.type) {
        case "MemberExpression":
          if (includes(imports, node.object.name)) {
            result.push(node.property.name);
          }
          break;
        case "CallExpression":
          // Detect chaining
          if (includes(imports, node.callee.name)) {
            result.push("chain");
          }
          break;
      }
    }
  });
  return result;
}

exports["default"] = function (code, options) {
  // let varName = lodash.result(options, 'varName', '_');
  var ast = parse(code, lodash.assign({}, acornOptions, lodash.result(options, "acorn")));

  var result = [];

  lodash(umd(ast, {
    amd: false,
    cjs: true,
    es6: true
  })).filter(function (node) {
    // consider adding lodash-fp & others
    return includes(["lodash", options.outfile], node.source.value);
  }).each(function (node) {
    // Add direct specifiers (`import {map, pick} from 'lodash'`)
    lodash(node.specifiers).map("imported").compact().each(function (requireNode) {
      result.push(requireNode.name);
    }).value();
  }).map(function (node) {
    // filter the specifiers down to the direct imports
    // (handles `import x,{y,z} from 'foo';)
    return {
      imports: reject(node.specifiers, "imported").map(function (x) {
        return x.local.name;
      }),
      scope: node.scope
    };
  }).each(function (node) {
    result.push.apply(result, _toConsumableArray(findModules(node)));
  }).value();

  return result;
};