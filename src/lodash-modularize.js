import path from 'path';
import fs from './fs';
import lodashModules from './lodashModules';
import parseForModules from './parseForModules';

import {flatten, includes, isArray, uniq, template} from 'lodash';
import Promise from 'bluebird';
const glob = Promise.promisify(require('glob'));

const templatePromise = fs.readFileAsync(path.join(__dirname, '../templates/import-build.tpl'))
  .then(templateStr => template(templateStr));

export function resolve(files, options) {
  return Promise.map(files,
      file => fs.readFileAsync(file).then(blob => parseForModules(String(blob), options)))
      .then(modules => {
        return uniq(flatten(modules));
      });
}

function modularize(fileGlob, options) {
  let files = (isArray(fileGlob) ? Promise.resolve(fileGlob) : glob(fileGlob))
    .then(files => resolve(files, options));

  return Promise.all([files, lodashModules, templatePromise])
    .spread((methods, modules, template) => {
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
            path: path.join(options.lodash, category, name)
          };
        });
        console.log(template({config}));
      }
    });
}

// Work around Esperanto bs
export default modularize;
module.exports = modularize;
