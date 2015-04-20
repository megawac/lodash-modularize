define(['lodash', 'smt', 'lodash-fp'], function(lo, s, fp) {
  lo.map([1,2,3], _.identity)
});

define('global', ['lodash'], function(_) {
  _([234, 1, 1, [1, [1, 1]]]).uniq().flatten();
});