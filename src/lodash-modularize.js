import fs from './fs';
import lodashModules from './lodashModules';
import parseForModules from './parseForModules';

import {flatten, includes, isArray, uniq} from 'lodash';
import Promise from 'bluebird';
const glob = Promise.promisify(require('glob'));

import esperantoBuild from './esperanto-build';
import cliBuild from './cli-build';
import Error from './Error';

export function resolve(files, options) {
  return Promise.map(files, file => {
    return fs.readFileAsync(file).then(blob => parseForModules(blob, file, options))
      .then(methods => {
        if (includes(methods, 'chain')) {
          throw new Error('Chaining syntax is not yet supported', file);
        }
        return methods;
      });
  })
  .then(methods => {
    return uniq(flatten(methods).sort(), true);
  });
}

export default function modularize(fileGlob, options) {
  let files = (isArray(fileGlob) ? Promise.resolve(fileGlob) : glob(fileGlob))
    .then(files => resolve(files, options));

  return Promise.all([files, lodashModules])
    .spread((methods, modules) => {
      // What to do with the resulting methods (e.g. export, list, etc)
      if (options.list) {
        return methods;
      }
      let code;
      if (options.compile) {
        code = cliBuild(methods, options);
      } else {
        code = esperantoBuild(methods, modules, options).code;
      }
      let $code = Promise.resolve(code);
      if (options.output) {
        return $code
          .then(code => fs.writeFileAsync(options.output, code))
          .then(() => $code);
      }
      return $code;
    });
}

module.exports = modularize;
