import {generate} from 'escodegen';
import {traverse} from 'estraverse';
import {extend, includes} from 'lodash';
import {Node} from 'acorn';

export function updateImportNode(node, outfile) {
  let {start, end, raw, type} = node.source;
  let rawOut = `'${outfile}'`;
  let sizeChange = rawOut.length - raw.length;
  return extend(new Node(), node, {
    end: node.end + sizeChange,
    source: {
      start,
      end: end + sizeChange,
      raw: rawOut,
      value: outfile,
      type
    }
  });
}

// Update the import references from the source to point at the
// new compiled file.
export default function updateReferences(ast, nodes, {outfile}) {

  let result = traverse(ast, {
    enter(node) {
      if (includes(nodes, node)) {
        return updateImportNode(node, outfile);
      }
    }
  });

  console.log(generate(ast, {comment: true, parse: true}));

  return result;
}
