import Promise from 'bluebird';
export default Promise.promisifyAll(require('fs'));
