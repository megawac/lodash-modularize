import acorn from 'acorn';
import umd from 'acorn-umd';

import lodash from 'lodash';

const acornOptions = {
  ecmaVersion: 6,

  // Be super loose (as who cares for this purpose)
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowHashBang: true
};

export default function(code, options) {
  let varName = lodash.result(options, 'varName', '_');
  let ast = acorn.parse(code, lodash.assign({}, acornOptions, lodash.result(options, 'acorn')));
  let {body} = ast;

  let imports = lodash(body).map(lodash.cloneDeep).filter({
      type: 'ImportDeclaration',
      source: {
        value: 'lodash'
      }
    })
    .pluck('specifiers')
    .flatten()
    .reject(specifier => {
      if (specifier.default) {
        varName = specifier.id.name;
        return true;
      }
    })
    .pluck('id').pluck('name')
    .value();

  console.log(ast);

  imports = umd(ast, {
    amd: true,
    cjs: true,
    es6: true
  });

  console.log(imports);
  return imports.concat();
}
