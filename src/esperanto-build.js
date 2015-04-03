import esperanto from 'esperanto';
import fs from 'fs';
import path from 'path';
import {includes, template} from 'lodash';

const tplPath = path.join(__dirname, '../templates/import-build.tpl');
const buildTemplate = template(fs.readFileSync(tplPath));

export default function build(methods, modules, options) {
  // Otherwise compile a file for them to the modularization
  let config = methods.map(name => {
    for (var category in modules) {
      if (includes(modules[category], name)) {
        break;
      }
    }
    return {
      name,
      path: path.join(options.lodashPath, category, name)
    };
  });

  let code = buildTemplate({config});
  let opts = {
    _evilES3SafeReExports: true,
    strict: false,
    name: 'lodash',
    amdName: 'lodash'
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
