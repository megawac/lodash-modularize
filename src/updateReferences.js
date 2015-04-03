import {extend, find, transform} from 'lodash';
import {Node} from 'acorn';
import recast from 'recast';

export const updaters = {
  ImportDeclaration(node, output) {
    let {start, end, raw, type} = node.source;
    let rawOut = `'${output}'`;
    let sizeChange = rawOut.length - raw.length;
    return extend(new Node(), node, {
      end: node.end + sizeChange,
      source: {
        start,
        end: end + sizeChange,
        raw: rawOut,
        value: output,
        type
      }
    });
  },

  CJSImport() {

  }
};

// Update the import references from the source to point at the
// new compiled file.
export default function updateReferences(code, path, nodes, {output}) {
  let ast = recast.parse(code);

  let visitors = transform(nodes, (memo, node) => {
    let {type} = node.reference;
    let updater = updaters[node.type];
    memo[`visit${type}`] = function(path) {
      let node = path.value;
      let {start, end} = node.loc;
      // Find the corresponding import for this node
      let other = find(nodes, {
        reference: {
          type, loc: {start, end}
        }
      });
      if (other && false) {
        updater.call(this, node, output);
      }
      this.traverse(path);
    };
  }, {});

  // console.log(ast.program.body);
  recast.visit(ast, visitors);

  console.log(recast.print(ast));
}
