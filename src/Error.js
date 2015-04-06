import 'colors';
const pkg = require('../package.json');

export default class ModularizeError extends Error {
  constructor(message, file) {
    super();
    Object.defineProperty(this, 'message', {
      value: `${message} in ${file.underline}`.red.bold + `
      If this is an issue please report to ${pkg.bugs.url}
      `
    });
  }

  get name () {
    return this.constructor.name;
  }
}
