 import modularize from '../../src/lodash-modularize';
import path from 'path';
// import fs from 'fs';
import {parse} from 'acorn';
import umd from 'acorn-umd';

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

  it('works on AMD modules', (done) => {
    modularize(filePath('amd.js'), {
      list: true
    })
    .then(modules => {
      expect(modules).to.deep.equal(['flatten', 'identity', 'map', 'uniq']);
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

describe('Basic transform produces valid JS', () => {
  it('on ES6 modules', (done) => {
    modularize(filePath('es6.js'), {exports: 'es6'})
    .then(({code}) => {
      let ast = parse(code, {ecmaVersion: 6, sourceType: 'module'});
      let modules = umd(ast, {es6: true, amd: false, cjs: false});
      expect(modules).to.have.length(4);
    })
    .then(done, done);
  });

  it('on CJS modules', (done) => {
    modularize(filePath('cjs.js'))
    .then(({code}) => {
      let ast = parse(code, {ecmaVersion: 6, sourceType: 'module'});
      let modules = umd(ast, {es6: false, amd: false, cjs: true});
      expect(modules).to.have.length(4);
      modules = umd(ast, {es6: false, amd: true, cjs: false});
      expect(modules).to.have.length(0);
    })
    .then(done, done);
  });

  it('on chaining', (done) => {
    modularize(filePath('chaining.js'))
    .then(({code}) => {
      let ast = parse(code, {ecmaVersion: 6, sourceType: 'module'});
      let modules = umd(ast, {es6: false, amd: false, cjs: true});
      expect(modules).to.have.length(14);
      modules = umd(ast, {es6: true, amd: true, cjs: true});
      expect(modules).to.have.length(14);
      modules = umd(ast, {es6: true, amd: true, cjs: false});
      expect(modules).to.have.length(0);
    })
    .then(done, done);
  });
});

describe('Lodash CLI compile', () => {
  it('on ES6 modules', function(done) {
    this.timeout(5000);
    modularize(filePath('es6.js'), {compile: true})
    .then(({code}) => {
      let ast = parse(code, {ecmaVersion: 6, sourceType: 'module'});
      let modules = umd(ast, {es6: true, amd: true, cjs: true});
      expect(modules).to.have.length(0);
    })
    .then(done, done);
  });
});
