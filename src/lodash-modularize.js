import path from 'path';
import fs from './fs';
import lodashModules from './lodashModules';
import parseForModules from './parseForModules';

import {flatten, includes, isArray, uniq, template} from 'lodash';
import Promise from 'bluebird';
const glob = Promise.promisify(require('glob'));

import esperanto from 'esperanto';
const tplPath = path.join(__dirname, '../templates/import-build.tpl');
const buildTemplate = template(fs.readFileSync(tplPath));

export function resolve(files, options) {
  return Promise.map(files,
      file => fs.readFileAsync(file).then(blob => parseForModules(String(blob), options)))
      .then(modules => {
        return uniq(flatten(modules));
      });
}

export function build(code, options) {
  let opts = {
    _evilES3SafeReExports: true,
    strict: false,
    name: 'lodash',
    amdName: 'lodash'
  };
  switch (options.outFormat) {
    case 'cjs':
      return esperanto.toCjs(code, opts);
    case 'amd':
      return esperanto.toAmd(code, opts);
    case 'umd':
      return esperanto.toUmd(code, opts);
    case 'es6':
      return {code};
  }
  throw `Unsupported format: ${options.outFormat}`;
}

function modularize(fileGlob, options) {
  let files = (isArray(fileGlob) ? Promise.resolve(fileGlob) : glob(fileGlob))
    .then(files => resolve(files, options));

  return Promise.all([files, lodashModules])
    .spread((methods, modules) => {
      // What to do with the resulting methods (e.g. export, list, etc)
      if (options.list) {
        return methods;
      } else if (options.compile) {

      } else {
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

        let {code} = build(buildTemplate({config}), options);

        if (options.outfile) {
          return fs.writeFile(options.outfile, code)
            .then(() => code);
        }
        return code;
      }
    });
}

// Work around Esperanto bs
export default modularize;
module.exports = modularize;
