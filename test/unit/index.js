import modularize from '../../src/lodash-modularize';
import path from 'path';
// import fs from 'fs';

const samplePath = path.join(__dirname, '../samples/');
function filePath(p) {
  return [path.join(samplePath, p)];
}

describe('Listing support', () => {
  it('works on ES6 modules', (done) => {
    modularize(filePath('es6.js'), {
      list: true
    })
    .then(modules => {
      expect(modules).to.deep.equal(['each', 'flatten', 'sortBy', 'uniq']);
    })
    .then(done, done);
  });

  it('works on CJS modules', (done) => {
    modularize(filePath('cjs.js'), {
      list: true
    })
    .then(modules => {
      expect(modules).to.deep.equal(['each', 'flatten', 'sortBy', 'uniq']);
    })
    .then(done, done);
  });

  it('supports chaining', (done) => {
    modularize(filePath('chaining.js'), {
      list: true
    })
    .then(modules => {
      expect(modules).to.deep.equal(['chain', 'each', 'flatten', 'isEmpty', 'map', 'reverse', 'sortBy', 'tap', 'toJSON', 'uniq', 'value']);
    })
    .then(done, done);
  });
});
