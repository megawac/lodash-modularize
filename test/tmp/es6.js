
import each from 'lodash/collection/each';
import flatten from 'lodash/array/flatten';
import sortBy from 'lodash/collection/sortBy';
import uniq from 'lodash/array/uniq';

export default function lodash() {
  throw 'lodash chaining is not included in this build. Try rebuilding.';
}

lodash.each = each;
lodash.flatten = flatten;
lodash.sortBy = sortBy;
lodash.uniq = uniq;