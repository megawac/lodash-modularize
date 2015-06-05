import {parse} from 'acorn';
import umd from 'acorn-umd';
import estraverse from 'estraverse';
import lodash, {compact, flatten, includes, map, reject} from 'lodash';
import {dirname, normalize, relative} from 'path';

import updateReferences from './updateReferences';
import Error from './Error';

const acornOptions = {
  ecmaVersion: 6,

  sourceType: 'module',

  // Be super loose (as who cares for this purpose)
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowHashBang: true
};

function matchesPath(valids, path) {
  return includes(valids, path) || includes(valids, normalize(path));
}

export function findModules(path, {imports, scope}) {
  let result = [];
  estraverse.traverse(scope, {
    enter(node) {
      switch (node.type) {
        case 'MemberExpression':
          if (includes(imports, node.object.name)) {
            if (node.computed) {
              let msg = `Could not id computed function ${node.object.name}[${node.property.name}]`;
              throw new Error(msg, path);
            }
            result.push(node.property.name);
          }
          break;
        case 'CallExpression': { // Detect chaining
          let callee = node;
          let props = [];
          while (callee = callee.callee) {
            if (callee.property) {
              props.push(callee.property.name);
            }
            if (callee.object) {
              callee = callee.object;
            }
            if (!callee.callee) {
              break;
            }
          }
          if (callee && includes(imports, callee.name)) {
            result.push(...props);
          }
          break;
        }
      }
    }
  });
  return result;
}

export default function(code, path, options) {
  let ast = parse(code, lodash.assign({
    ranges: true,
    locations: true
  }, acornOptions, lodash.result(options, 'acorn')));

  let result = [];

  let outputFile = options.output && relative(dirname(path), options.output);

  // imports to consider lodash (e.g. lodash-compact, lodash, etc)
  let lodashOptions = compact(flatten([options.lodash, normalize, outputFile]));

  lodash(umd(ast, {
      amd: false,
      cjs: includes(options.format, 'cjs'),
      es6: includes(options.format, 'es6')
    }))
    .filter(node => {
      // consider adding lodash-fp & others
      return matchesPath(lodashOptions, node.source.value);
    })
    .each(node => {
      // Add direct specifiers (`import {map, pick} from 'lodash'`)
      lodash(node.specifiers)
        .map('imported').compact()
        .each(requireNode => {
          result.push(requireNode.name);
        }).value();
    })
    .tap(nodes => {
      if (options.update && nodes.length) {
        updateReferences(code, path, nodes, options);
      }
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
      result.push(...findModules(path, node));
    }).value();

  lodash(umd(ast, {
      amd: includes(options.format, 'amd'),
      cjs: false,
      es6: false
    }))
    .map(define => {
      let imports = define.imports.filter(specifier =>
          matchesPath(lodashOptions, specifier[0].value));
      if (imports.length) {
        return {
          imports,
          scope: define.scope,
          type: define.type
        };
      }
    })
    .compact()
    .tap(nodes => {
      let imports = flatten(nodes.map(nodes => map(nodes.imports, 0)));
      if (options.update && imports.length) {
        updateReferences(code, path, imports, options, nodes[0].type);
      }
    })
    .map(node => {
      // filter the specifiers down to the direct imports
      // (handles `import x,{y,z} from 'foo';)
      return {
        imports: node.imports.map(zip => zip[1].name),
        scope: node.scope.block
      };
    })
    .each(node => {
      result.push(...findModules(path, node));
    }).value();

  if (typeof options.global === 'string') {
    result.push(...findModules(path, {
      imports: [options.global],
      scope: ast
    }));
  }

  return result;
}
