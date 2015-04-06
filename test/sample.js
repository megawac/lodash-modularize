import _, {sortBy, uniq} from 'lodash';
let log = require('logger'),
    lodash = require('lodash');

let result = sortBy(_.flatten(uniq([{a: 1}, {a: 2}, {a: 1}, {a: 0}])), 'a');
lodash.each(result, log);