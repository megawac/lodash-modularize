import fs from './fs';
import lodashModules from './lodashModules';
import parseForModules from './parseForModules';

import {flatten, isArray, uniq} from 'lodash';
import Promise from 'bluebird';
const glob = Promise.promisify(require('glob'));

function resolve(modules, files, options) {
  return Promise.map(files,
      file => fs.readFileAsync(file).then(blob => parseForModules(String(blob), options)))
      .then(modules => {
        return uniq(flatten(modules));
      })
      .then(console.log);
}

function modularize(fileGlob, options) {
  let files = isArray(fileGlob) ? Promise.resolve(fileGlob) : glob(fileGlob);
  return Promise.all([files, lodashModules]).spread(
      (files, modules) => resolve(modules, files, options));
}

// Work around Esperanto bs
export default modularize;
module.exports = modularize;
