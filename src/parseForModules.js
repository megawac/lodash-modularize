import {parse} from 'acorn';
import umd from 'acorn-umd';
import estraverse from 'estraverse';
import lodash, {compact, includes, reject} from 'lodash';

const acornOptions = {
  ecmaVersion: 6,

  sourceType: 'module',

  // Be super loose (as who cares for this purpose)
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowHashBang: true
};

export function findModules({imports, scope}) {
  let result = [];
  estraverse.traverse(scope, {
    enter(node) {
      switch (node.type) {
        case 'MemberExpression':
          if (includes(imports, node.object.name)) {
            if (node.computed) {
              throw `Could not id computed function ${node.object.name}[${node.property.name}]`;
            }
            result.push(node.property.name);
          }
        break;
        case 'CallExpression': // Detect chaining
          if (includes(imports, node.callee.name)) {
            result.push('chain');
          }
        break;
      }
    }
  });
  return result;
}

export default function(code, options) {
  let ast = parse(code, lodash.assign({}, acornOptions, lodash.result(options, 'acorn')));
  let result = [];

  // imports to consider lodash (e.g. lodash-compact, lodash, etc)
  let lodashOptions = compact([options.lodash, options.output]);

  lodash(umd(ast, {
      amd: false,
      cjs: includes(options.format, 'cjs'),
      es6: includes(options.format, 'es6')
    }))
    .filter(node => {
      // consider adding lodash-fp & others
      return includes(lodashOptions, node.source.value);
    })
    .each(node => {
      // Add direct specifiers (`import {map, pick} from 'lodash'`)
      lodash(node.specifiers)
        .map('imported').compact()
        .each(requireNode => {
          result.push(requireNode.name);
        }).value();
    })
    .map(node => {
      // filter the specifiers down to the direct imports
      // (handles `import x,{y,z} from 'foo';)
      return {
        imports: reject(node.specifiers, 'imported')
                  .map(x => x.local.name),
        scope: node.scope.block
      };
    })
    .each(node => {
      result.push(...findModules(node));
    }).value();

  if (typeof options.global === 'string') {
    result.push(...findModules({
      imports: [options.global],
      scope: ast
    }));
  }

  return result;
}
