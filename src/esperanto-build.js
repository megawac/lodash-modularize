import esperanto from 'esperanto';
import fs from 'fs';
import path from 'path';
import lodash, {includes, result, template} from 'lodash';

import chainableMethods from './lodash-chainable';

const buildPath = path.join(__dirname, '../templates/import-build.tpl');
const chainPath = path.join(__dirname, '../templates/chain-build.tpl');
const normalTemplate = template(fs.readFileSync(buildPath));
const chainTemplate = template(fs.readFileSync(chainPath));

export default function build(methods, modules, options) {
  let _path = result(options, 'lodashPath', '');
  let {ext, dir, name, base} = path.parse(_path);
  // Don't rel a cjs import
  if (options.output != null &&
    (ext !== '' || dir !== '' || name !== base)
  ) {
    _path = path.relative(path.dirname(options.output), _path);
  }

  // Otherwise compile a file for them to the modularization
  let config = lodash.chain(methods)
    .map(name => {
      for (var category in modules) {
        if (includes(modules[category], name)) {
          break;
        }
      }
      return {
        name,
        propString: `${name}: ${name}`,
        path: path.join(_path, category, name),
        chained: chainableMethods[name]
      };
    })
    .partition(node => /\/chain\//.test(node.path))
    .value();

  let template = includes(methods, 'chain') ? chainTemplate : normalTemplate;
  let code = template({
    config: config[1],
    chainMethods: config[0],
    lodashPath: _path
  });

  let opts = {
    _evilES3SafeReExports: true,
    strict: false,
    name: options.global || '_'
  };
  switch (options.exports) {
    case 'cjs':
      return esperanto.toCjs(code, opts);
    case 'amd':
      return esperanto.toAmd(code, opts);
    case 'umd':
      return esperanto.toUmd(code, opts);
    case 'es6':
      return {code};
  }
  throw `Unsupported format: ${options.exports}`;
}
