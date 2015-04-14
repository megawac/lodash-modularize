import _, {sortBy, uniq} from 'lodash';
import log from 'logger';
import lodash from 'lodash';

let result = sortBy(_.flatten(uniq([{a: 1}, {a: 2}, {a: 1}, {a: 0}])), 'a');
lodash.each(result, log);
