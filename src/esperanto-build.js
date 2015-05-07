import esperanto from 'esperanto';
import fs from 'fs';
import path from 'path';
import lodash, {includes, result, template} from 'lodash';

import {aliasToReal} from 'lodash-cli/lib/mapping';

import chainableMethods from './lodash-chainable';

const buildPath = path.join(__dirname, '../templates/import-build.tpl');
const chainPath = path.join(__dirname, '../templates/chain-build.tpl');
const normalTemplate = template(fs.readFileSync(buildPath));
const chainTemplate = template(fs.readFileSync(chainPath));

export default function build(methods, modules, options) {
  let _path = result(options, 'lodashPath') || '';
  let {ext, dir, name, base} = path.parse(_path);
  let chainBuild = includes(methods, 'chain');

  // Don't rel a cjs import
  if (options.output != null &&
    (ext !== '' || dir !== '' || name !== base)
  ) {
    _path = path.relative(path.dirname(options.output), _path);
  }

  if (options.useNpmModules && chainBuild) {
    throw new Error('Cannot currently use npm modules with a library using chaining');
  }

  // Otherwise compile a file for them to the modularization
  let config = lodash.chain(methods)
    .map(name => {
      for (var category in modules) {
        if (includes(modules[category], name)) {
          break;
        }
      }
      let realName = result(aliasToReal, name, name);
      return {
        name,
        propString: `${name}: ${name}`,
        path: options.useNpmModules ?
          `lodash.${realName.toLowerCase()}` :
          path.join(_path, category, realName),
        chained: chainableMethods[name]
      };
    })
    .partition(node => /\/chain\//.test(node.path))
    .value();

  let template = chainBuild ? chainTemplate : normalTemplate;
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
