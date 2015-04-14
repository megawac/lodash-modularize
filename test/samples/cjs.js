var sortBy = require('lodash').sortBy,
    uniq = require('lodash').uniq;
var log = require('logger');
var lodash = require('lodash');

let result = sortBy(lodash.flatten(uniq([{a: 1}, {a: 2}, {a: 1}, {a: 0}])), 'a');
lodash.each(result, log);
