import {find, transform} from 'lodash';
import recast from 'recast';
import path from 'path';
import fs from 'fs';

import Error from './Error';

const builders = recast.types.builders;

function replaceRequire(node, output) {
  return builders.callExpression(node.callee, [builders.literal(output)]);
}

export const updaters = {
  ImportDeclaration(path, node, output) {
    let source = builders.moduleSpecifier(output);
    let r = builders.importDeclaration(node.specifiers, source);
    path.replace(r);
  },

  AMDImport(path, node, output) {
    path.replace(builders.literal(output));
  },

  CJSImport(path, node, output) {
    switch (node.type) {
      case 'VariableDeclarator': {
        let {id, init} = node;
        path.replace(builders.variableDeclarator(id,
                        replaceRequire(init, output)));
        break;
      }
      // Annoyingly redundant
      case 'VariableDeclaration': {
        let {id, init} = node.declarations[0];

        path.replace(builders.variableDeclaration(node.kind, [
          builders.variableDeclarator(id, replaceRequire(init, output))
        ]));
        break;
      }
      case 'AssignmentExpression': {
        let {operator, left, right} = node;
        path.replace(builders.assignmentExpression(operator, left, replaceRequire(right, output)));
        break;
      }
      case 'Property': {
        path.replace(builders.property(node.kind, node.key, replaceRequire(node.value, output)));
        break;
      }
      case 'CallExpression': {
        path.replace(replaceRequire(node, output));
        break;
      }
      default:
        let msg = `${node.type} commonjs imports are not currently supported (file an issue)`;
        throw new Error(msg, output);
    }
  }
};

// Update the import references from the source to point at the
// new compiled file.
export default function updateReferences(code, source, nodes, {output}) {
  output = path.relative(path.dirname(source), output);
  let ast = recast.parse(code);
  let visitors = transform(nodes, (memo, nodeWrapper) => {
    let {type: format, reference: node} = nodeWrapper;
    let {type} = node;
    let updater = updaters[format];
    memo[`visit${type}`] = function(path) {
      let node = path.value;
      let {start, end} = node.loc;
      // Find the corresponding import for this node
      let other = find(nodes, {
        reference: {
          type, loc: {start, end}
        }
      });
      if (other) {
        updater(path, node, output);
      }
      this.traverse(path);
    };
  }, {});

  recast.visit(ast, visitors);
  fs.writeFile(source, recast.print(ast).code);
}
