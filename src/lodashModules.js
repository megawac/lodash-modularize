import Promise from 'bluebird';
import path from 'path';
import {zipObject} from 'lodash';
import fs from 'fs';

function getDirectories(srcpath) {
  return fs.readdirAsync(srcpath).filter(file =>
        fs.statAsync(path.join(srcpath, file)).then(stat => stat.isDirectory()));
}

let lodashPath = path.join(__dirname, '../node_modules/lodash');
let m;

export default getDirectories(lodashPath).then(modules => {
  m = modules;
  return Promise.map(modules, val => {
    return fs.readdirAsync(path.join(lodashPath, val)).map(name => name.slice(0, -3));
  });
})
.then(functions => zipObject(m, functions));
